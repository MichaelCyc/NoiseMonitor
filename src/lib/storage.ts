import { Capacitor } from "@capacitor/core";
import { translate } from "./i18n";
import type { Language } from "./i18n";

export type Settings = {
  offset: number;
  threshold: number;
  response: "fast" | "slow";
};
export type SessionRecord = {
  id: string;
  startedAt: string;
  duration: number;
  min: number;
  max: number;
  average: number;
  source: "mic" | "demo";
  offset: number;
  threshold: number;
};
export const defaultSettings: Settings = {
  offset: 94,
  threshold: 70,
  response: "slow",
};
export function readSettings(): Settings {
  try {
    const value = JSON.parse(localStorage.getItem("sonora-settings") || "null");
    if (!value) return defaultSettings;
    return {
      offset:
        Number.isFinite(value.offset) &&
        value.offset >= 40 &&
        value.offset <= 140
          ? value.offset
          : 94,
      threshold:
        Number.isFinite(value.threshold) &&
        value.threshold >= 40 &&
        value.threshold <= 100
          ? value.threshold
          : 70,
      response: value.response === "fast" ? "fast" : "slow",
    };
  } catch {
    return defaultSettings;
  }
}
export function readHistory(): SessionRecord[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("sonora-history") || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (v): v is SessionRecord =>
          v &&
          typeof v.id === "string" &&
          typeof v.startedAt === "string" &&
          Number.isFinite(Date.parse(v.startedAt)) &&
          (v.source === "mic" || v.source === "demo") &&
          ["duration", "min", "max", "average", "offset", "threshold"].every(
            (key) => Number.isFinite(v[key]),
          ),
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}
export function saveLocal(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export async function exportRecords(
  records: SessionRecord[],
  language: Language = "zh-CN",
): Promise<"downloaded" | "shared" | "cancelled"> {
  const t = (key: string, values?: Record<string, string | number>) =>
    translate(language, key, values);
  const rows = [
    [
      "开始时间",
      "数据来源",
      "测量时长(秒)",
      "平均估算分贝(dB)",
      "最低估算分贝(dB)",
      "最高估算分贝(dB)",
      "参考偏移(dB)",
      "提醒阈值(dB)",
    ].map((heading) => t(heading)),
    ...records.map((r) => [
      new Date(r.startedAt).toLocaleString(
        language === "en" ? "en-US" : "zh-CN",
      ),
      t(r.source === "demo" ? "模拟演示" : "麦克风"),
      Math.round(r.duration),
      r.average.toFixed(1),
      r.min.toFixed(1),
      r.max.toFixed(1),
      r.offset,
      r.threshold,
    ]),
  ];
  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
  const filename = t("声境-测量记录-{date}.csv", {
    date: new Date().toISOString().slice(0, 10),
  });
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } =
      await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const file = await Filesystem.writeFile({
      path: `exports/${filename}`,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    try {
      await Share.share({
        title: t("声境测量记录"),
        files: [file.uri],
        dialogTitle: t("保存或分享测量记录"),
      });
      return "shared";
    } catch (error) {
      if (
        /cancel/i.test(error instanceof Error ? error.message : String(error))
      )
        return "cancelled";
      throw error;
    }
  }
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
