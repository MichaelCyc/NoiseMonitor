import { afterEach, expect, it, vi } from "vitest";
import { readLanguage, translate } from "./i18n";
import { microphoneError } from "./audio";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

it("uses the device language on first launch and honors a saved choice", () => {
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["zh-TW", "en-US"]);
  expect(readLanguage()).toBe("zh-CN");
  localStorage.setItem("sonora-language", "en");
  expect(readLanguage()).toBe("en");
  localStorage.setItem("sonora-language", "invalid");
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-GB"]);
  expect(readLanguage()).toBe("en");
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["fr-FR"]);
  expect(readLanguage()).toBe("en");
});

it("still selects a language when local storage cannot be read", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage unavailable");
  });
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
  expect(readLanguage()).toBe("en");
});

it("localizes parameterized alerts and Android permission guidance", () => {
  expect(
    translate("en", "当前声量已超过 {threshold} dB 提醒值", { threshold: 75 }),
  ).toBe("Sound level is above your 75 dB alert");
  expect(
    translate(
      "en",
      microphoneError(new DOMException("", "NotAllowedError"), true),
    ),
  ).toContain("Settings → Apps → Sonora → Permissions");
  expect(translate("zh-CN", "最近 {seconds} 秒", { seconds: 30 })).toBe(
    "最近 30 秒",
  );
  expect(translate("en", "USB microphone")).toBe("USB microphone");
});
