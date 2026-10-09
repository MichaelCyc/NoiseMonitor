# 声境 Android 使用与构建指南

## 安装到手机

1. 在电脑运行 `npm run android:apk`。
2. 将生成的 `artifacts/sonora-1.1.0-debug.apk` 通过 USB、网盘或文件传输发送到手机。
3. 在手机文件管理器中打开 APK；如果系统提示，为当前文件管理器允许「安装未知应用」，然后安装。
4. 打开「声境」，点击「开始监测」，选择允许使用麦克风。

页面、图标和字体都在 APK 中。安装后不需要打开电脑、不需要开发服务器，也不需要联网。系统可能把麦克风权限称为「录制音频」：本应用仅使用实时音频计算声量，不保存录音。

Android 7.0（API 24）及以上可安装，目标版本为 Android 16（API 36）。请保持 Android System WebView 或 Chrome 更新，旧 WebView 可能缺少所需的 Web Audio 能力。这里只提供前台监测：锁屏、切换应用或在首页按返回键后会暂停；返回应用可继续。

## 构建环境

- Node.js 22.12+，推荐 Node.js 24。
- JDK 21（Android Studio 的 JBR 21 也可以）。
- Android SDK Platform 36、Build Tools 36.0.0、Platform Tools。
- 首次构建需要下载 Gradle 和 Maven 依赖，手机运行不依赖这些下载。

脚本按 `SONORA_JAVA_HOME`、`JAVA_HOME`、项目 `.android-tools/jdk-21...`、标准 Android Studio JBR 路径查找 JDK。SDK 从 `ANDROID_HOME`、`ANDROID_SDK_ROOT` 或系统常用目录查找。只为构建子进程设置环境，不修改系统的 Java 设置。

PowerShell 示例（将路径替换成实际安装位置）：

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm install
npm run android:apk
```

常用命令：

| 命令                      | 用途                                           |
| ------------------------- | ---------------------------------------------- |
| `npm test`                | 验证音频处理、生命周期及 Web/Android 导出分支  |
| `npm run android:sync`    | 构建网页并同步到 Android 工程                  |
| `npm run android:apk`     | 同步资源、构建开发签名 APK，并复制到 artifacts |
| `npm run android:open`    | 同步后使用 Android Studio 打开 Android 工程    |
| `npm run android:install` | 将已构建的 APK 安装到通过 ADB 连接的设备       |

项目使用 Gradle 8.13 和 Android Gradle Plugin 8.13.0。构建脚本会复用本机已有的 Gradle 8.13 完整分发，找不到则通过项目 Wrapper 下载。修改网页后必须重新运行 `android:apk`，旧 APK 不会自动更新。

## USB 安装

在手机开发者选项中开启 USB 调试，连接电脑，并在手机上允许当前电脑调试。先检查连接：

```sh
adb devices
npm run android:install
```

ADB 同时连接多个设备时，请明确指定目标：

```sh
adb -s YOUR_DEVICE_SERIAL install -r artifacts/sonora-1.1.0-debug.apk
```

## Android Studio

如果 Android Studio 安装在自定义路径，先设置可执行文件的位置：

```powershell
$env:CAPACITOR_ANDROID_STUDIO_PATH = 'D:\Program Files\Android\bin\studio64.exe'
npm run android:open
```

也可以在 Android Studio 中直接打开项目的 `android` 文件夹。Gradle JDK 选择 JDK 21，并确保 SDK 路径正确。

## 正式发布

当前输出是 `debug` APK，适合自己安装和功能测试；它不是应用商店发布包。正式分发时，在 Android Studio 选择 **Build → Generate Signed App Bundle / APK**，使用自己保管的发布密钥签名，并保留密钥以便后续更新。Google Play 使用 AAB。每次正式更新需要增加 `android/app/build.gradle` 中的 `versionCode`。

不要把签名密钥或密码提交到仓库。生产签名与 debug 签名不同，同一个包名不能直接覆盖安装；切换签名前先导出测量记录。此项目不会生成或替用户保管发布密钥。

## 权限、数据和导出

- 包名：`cn.sonora.noisemonitor`，显示名称：声境。
- `RECORD_AUDIO` 在首次点击开始时由 Capacitor 的 WebView 权限桥请求；还声明 `MODIFY_AUDIO_SETTINGS`。没有摄像头、定位或广泛存储权限。
- 麦克风权限被拒绝后，到手机「设置 → 应用 → 声境 → 权限」重新开启。
- 测量摘要与设置保存在应用的本地 WebView 存储中，和电脑浏览器的记录相互独立。清除应用数据或卸载应用会删除记录；禁用应用备份以避免测量摘要自动进入云备份。
- 导出先把 CSV 写入私有缓存的 `exports/` 目录，再打开系统分享面板。文件只通过临时 URI 权限交给用户选中的应用。选择文件管理器保存，或选一个支持接收 CSV 的应用。取消分享不会影响已有测量记录。
- 缓存 CSV 不是永久备份；系统可能清理应用缓存。需要保留时请通过分享面板保存到自己的文件目录。
- 读数仍是设备估算分贝，需要逐台设备校准，不等同于专业声级计的 dB(A)。

## 排错与验证范围

工程已使用完整依赖资源合并（`android.precompileDependenciesResources=false`），避免当前 Windows / AGP 8.13 环境下预编译依赖资源导致 AppCompat 布局和动画缺失。

- **Gradle 下载超时**：检查对 Gradle 分发、Google Maven 与 Maven Central 的网络访问。构建不关闭 TLS 验证。
- **Unable to establish loopback connection / Invalid argument: connect**：部分 Windows 环境的 JDK AF_UNIX 连接失败。命令行构建脚本为构建子进程选择 JDK 自带的 TCP 回环回退方式，不修改系统网络设置。不要创建 `.android-tools/tcp-loopback-only` 目录；设置 `SONORA_USE_UNIX_SOCKETS=1` 可保留 JDK 默认行为。直接在 Android Studio 构建时，可将同样的 `-Djdk.net.unixdomain.tmpdir=一个不存在的目录` 加入 Gradle JVM 参数。
- **没有 ADB 设备**：确认 USB 数据线、驱动、USB 调试以及手机上的授权状态。也可直接传输 APK 到手机安装。
- **安装后空白或麦克风 API 不可用**：更新 Android System WebView，重新启动应用，并检查麦克风权限。

自动测试覆盖已知音频信号、暂停计时、权限拒绝、取消连接、Android 后台事件以及 CSV 缓存与分享。模拟音频测试不能替代真机麦克风测试和精度校准；Android 的权限界面、厂商音频处理和系统分享接收应用需要在目标手机上验证。

本次已通过 13 项自动测试、Android APK 构建、APK v2 签名校验及打包网页资源一致性检查，并在 Pixel 5a（Android 14）上完成安装和冷启动。真实环境声量与精度仍需用户允许麦克风后进行验证和校准。
