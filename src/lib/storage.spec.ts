import { afterEach, expect, it, vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
vi.mock("@capacitor/filesystem", () => ({
  Filesystem: { writeFile: vi.fn() },
  Directory: { Cache: "CACHE" },
  Encoding: { UTF8: "utf8" },
}));
vi.mock("@capacitor/share", () => ({ Share: { share: vi.fn() } }));
import {
  defaultSettings,
  exportRecords,
  readHistory,
  readSettings,
} from "./storage";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("exports Chinese CSV with a UTF-8 BOM and an explicit simulated-data source", async () => {
  vi.useFakeTimers();
  let csvBlob!: Blob;
  let filename = "";
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    csvBlob = blob as Blob;
    return "blob:sonora-test";
  });
  const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    filename = this.download;
  });
  await exportRecords([
    {
      id: "test",
      startedAt: "2026-10-09T06:00:00Z",
      source: "demo",
      duration: 65,
      average: 45.5,
      min: 33,
      max: 72,
      offset: 94,
      threshold: 70,
    },
  ]);
  const bytes = new Uint8Array(await csvBlob.arrayBuffer());
  expect(Array.from(bytes.slice(0, 3))).toEqual([239, 187, 191]);
  const text = await csvBlob.text();
  expect(text).toContain('"模拟演示","65","45.5","33.0","72.0","94","70"');
  expect(text).toContain("平均估算分贝(dB)");
  expect(filename).toMatch(/^声境-测量记录-.*\.csv$/);
  vi.advanceTimersByTime(1000);
  expect(revoke).toHaveBeenCalledWith("blob:sonora-test");
});

it("exports native CSV through the system share sheet using only private cache storage", async () => {
  vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
  vi.mocked(Filesystem.writeFile).mockResolvedValue({
    uri: "file:///app/cache/exports/test.csv",
  });
  vi.mocked(Share.share).mockResolvedValue({ activityType: "files" });
  expect(await exportRecords([])).toBe("shared");
  expect(Filesystem.writeFile).toHaveBeenCalledWith(
    expect.objectContaining({
      directory: "CACHE",
      encoding: "utf8",
      path: expect.stringMatching(/^exports\/声境-测量记录-.*\.csv$/),
    }),
  );
  expect(Share.share).toHaveBeenCalledWith(
    expect.objectContaining({ files: ["file:///app/cache/exports/test.csv"] }),
  );
  vi.mocked(Share.share).mockRejectedValueOnce(new Error("Share canceled"));
  expect(await exportRecords([])).toBe("cancelled");
  vi.mocked(Share.share).mockRejectedValueOnce(
    new Error("Storage unavailable"),
  );
  await expect(exportRecords([])).rejects.toThrow("Storage unavailable");
});

it("recovers safely from corrupt or invalid browser storage", () => {
  localStorage.setItem("sonora-history", "{broken");
  expect(readHistory()).toEqual([]);
  localStorage.setItem(
    "sonora-history",
    JSON.stringify([
      { id: "invalid", startedAt: "invalid-date", source: "demo" },
    ]),
  );
  expect(readHistory()).toEqual([]);
  localStorage.setItem(
    "sonora-settings",
    JSON.stringify({ offset: -1, threshold: 900, response: "invalid" }),
  );
  expect(readSettings()).toEqual(defaultSettings);
});

it("exports English native CSV, filenames and share labels with unchanged measurements", async () => {
  vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
  vi.mocked(Filesystem.writeFile).mockResolvedValue({
    uri: "file:///app/cache/exports/english.csv",
  });
  vi.mocked(Share.share).mockResolvedValue({ activityType: "files" });
  await exportRecords(
    [
      {
        id: "english",
        startedAt: "2026-10-09T06:00:00Z",
        source: "demo",
        duration: 65,
        average: 45.5,
        min: 33,
        max: 72,
        offset: 94,
        threshold: 70,
      },
    ],
    "en",
  );
  const written = vi.mocked(Filesystem.writeFile).mock.lastCall![0];
  expect(written.path).toMatch(/^exports\/Sonora-measurements-.*\.csv$/);
  expect(written.data).toContain("Average estimated level (dB)");
  expect(written.data).toContain('"Demo","65","45.5","33.0","72.0","94","70"');
  expect(written.data).not.toMatch(/[\u3400-\u9fff]/);
  expect(Share.share).toHaveBeenLastCalledWith({
    title: "Sonora measurements",
    files: ["file:///app/cache/exports/english.csv"],
    dialogTitle: "Save or share measurements",
  });
});
