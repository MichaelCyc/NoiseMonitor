import {
  existsSync,
  readdirSync,
  readFileSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const windows = process.platform === "win32";
const env = { ...process.env };
const localTools = join(root, ".android-tools");
const installOnly = process.argv.includes("--install");
const jdkCandidates = [
  env.SONORA_JAVA_HOME,
  env.JAVA_HOME,
  ...(existsSync(localTools)
    ? readdirSync(localTools)
        .filter((name) => name.startsWith("jdk-"))
        .map((name) => join(localTools, name))
    : []),
  windows
    ? "C:/Program Files/Android/Android Studio/jbr"
    : "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
];
const javaHome = jdkCandidates.find((candidate) => {
  if (!candidate || !existsSync(join(candidate, "release"))) return false;
  const version = readFileSync(join(candidate, "release"), "utf8").match(
    /JAVA_VERSION="(\d+)/,
  )?.[1];
  return (
    Number(version) === 21 &&
    existsSync(join(candidate, "bin", windows ? "javac.exe" : "javac"))
  );
});
if (!javaHome && !installOnly) {
  console.error(
    "需要 JDK 21。请设置 SONORA_JAVA_HOME 或 JAVA_HOME，也可解压到项目 .android-tools/jdk-21... 目录。",
  );
  process.exit(1);
}
const sdkHome = [
  env.ANDROID_HOME,
  env.ANDROID_SDK_ROOT,
  env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Android", "Sdk"),
  env.HOME &&
    join(
      env.HOME,
      process.platform === "darwin" ? "Library/Android/sdk" : "Android/Sdk",
    ),
].find(
  (candidate) => candidate && existsSync(join(candidate, "platform-tools")),
);
if (!sdkHome) {
  console.error(
    "找不到 Android SDK，请设置 ANDROID_HOME，并安装 Android SDK Platform 36 和 Build Tools 36.0.0。",
  );
  process.exit(1);
}
if (javaHome) env.JAVA_HOME = javaHome;
env.ANDROID_HOME = sdkHome;
if (windows && env.SONORA_USE_UNIX_SOCKETS !== "1") {
  // Some Windows hosts advertise AF_UNIX but reject connections. An unavailable
  // AF_UNIX temp directory selects the JDK's built-in TCP loopback fallback.
  // This affects build processes only, without changing system network settings.
  const unavailableSocketDirectory = join(localTools, "tcp-loopback-only");
  if (!existsSync(unavailableSocketDirectory)) {
    env.JAVA_TOOL_OPTIONS = [
      env.JAVA_TOOL_OPTIONS,
      `"-Djdk.net.unixdomain.tmpdir=${unavailableSocketDirectory}"`,
    ]
      .filter(Boolean)
      .join(" ");
  }
}
// Reuse a complete Gradle 8.13 distribution if already installed on this machine.
const cachedGradleRoot = join(
  env.GRADLE_USER_HOME || join(homedir(), ".gradle"),
  "wrapper/dists/gradle-8.13-all",
);
const cachedGradle = existsSync(cachedGradleRoot)
  ? readdirSync(cachedGradleRoot)
      .map((name) => join(cachedGradleRoot, name, "gradle-8.13", "bin"))
      .find((dir) => existsSync(join(dir, windows ? "gradle.bat" : "gradle")))
  : undefined;
if (cachedGradle)
  env.PATH = `${cachedGradle}${windows ? ";" : ":"}${env.PATH || ""}`;
const executable = windows ? env.ComSpec || "cmd.exe" : "./gradlew";
const args = windows
  ? [
      "/d",
      "/c",
      cachedGradle ? "gradle.bat" : "gradlew.bat",
      "assembleDebug",
      "--console=plain",
      "--no-daemon",
    ]
  : ["assembleDebug", "--console=plain", "--no-daemon"];
const version = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
).version;
const artifact = join(root, "artifacts", `sonora-${version}-debug.apk`);
if (!installOnly) {
  console.log(`JDK: ${javaHome}\nAndroid SDK: ${sdkHome}`);
  const result = spawnSync(executable, args, {
    cwd: join(root, "android"),
    env,
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) {
    console.error(
      result.error?.message || "Android 构建失败，请查看上方 Gradle 错误。",
    );
    process.exit(result.status || 1);
  }
  mkdirSync(dirname(artifact), { recursive: true });
  copyFileSync(
    join(root, "android/app/build/outputs/apk/debug/app-debug.apk"),
    artifact,
  );
  const checksum = createHash("sha256")
    .update(readFileSync(artifact))
    .digest("hex");
  writeFileSync(
    `${artifact}.sha256`,
    `${checksum}  sonora-${version}-debug.apk\n`,
  );
  console.log(`\nAPK 已生成：${artifact}`);
} else {
  if (!existsSync(artifact)) {
    console.error("请先运行 npm run android:apk 生成安装包。");
    process.exit(1);
  }
  const adb = join(sdkHome, "platform-tools", windows ? "adb.exe" : "adb");
  const result = spawnSync(adb, ["install", "-r", artifact], {
    env,
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
