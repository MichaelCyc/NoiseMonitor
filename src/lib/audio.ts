export type SoundLevel = {
  label: string;
  description: string;
  color: string;
  className: string;
};
export function getSoundLevel(db: number): SoundLevel {
  if (db < 35)
    return {
      label: "非常安静",
      description: "轻声细语，享受安静时刻",
      color: "#81a78c",
      className: "quiet",
    };
  if (db < 55)
    return {
      label: "安静舒适",
      description: "适合专注，也适合放松",
      color: "#799955",
      className: "comfortable",
    };
  if (db < 70)
    return {
      label: "日常声量",
      description: "周围的声音渐渐热闹起来",
      color: "#c5a355",
      className: "moderate",
    };
  if (db < 85)
    return {
      label: "有些嘈杂",
      description: "可以换一个更安静的地方",
      color: "#d28b62",
      className: "loud",
    };
  return {
    label: "声音较大",
    description: "建议降低声源音量，减少暴露",
    color: "#ce6d63",
    className: "very-loud",
  };
}
/** Digital amplitude only. An offset is a device-dependent estimate, not dBA. */
export function rmsToDbfs(rms: number): number {
  return 20 * Math.log10(Math.max(rms, 1e-6));
}
export function calculateRms(samples: Float32Array): number {
  if (!samples.length) return 0;
  let mean = 0;
  for (const value of samples) mean += value;
  mean /= samples.length;
  let squares = 0;
  for (const value of samples) squares += (value - mean) ** 2;
  return Math.sqrt(squares / samples.length);
}
export function energyAverage(energySum: number, count: number): number {
  return count > 0 ? 10 * Math.log10(energySum / count) : 0;
}
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const parts = [Math.floor(total / 60) % 60, total % 60].map((n) =>
    String(n).padStart(2, "0"),
  );
  if (total >= 3600)
    parts.unshift(String(Math.floor(total / 3600)).padStart(2, "0"));
  return parts.join(":");
}
export function microphoneError(error: unknown, android = false): string {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return android
      ? "麦克风权限未开启。请在手机「设置 → 应用 → 声境 → 权限」中允许使用麦克风，再重新开始。"
      : "麦克风权限未开启。请在浏览器地址栏的网站设置中允许使用麦克风，再重新开始。";
  if (name === "NotFoundError")
    return "没有找到麦克风。请连接麦克风后重试，或先体验演示模式。";
  if (name === "NotReadableError" || name === "AbortError")
    return "暂时无法读取麦克风。请检查设备连接，或关闭正在独占麦克风的应用后重试。";
  return error instanceof Error
    ? error.message
    : "无法启动麦克风，请检查设备连接后重试。";
}
