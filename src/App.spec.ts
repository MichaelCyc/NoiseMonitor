import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import { LanguageProvider } from "./hooks/useLanguage";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({
    toFake: [
      "setInterval",
      "clearInterval",
      "performance",
      "setTimeout",
      "clearTimeout",
    ],
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

const renderApp = () =>
  render(createElement(LanguageProvider, null, createElement(App)));

it("switches languages during measurement, keeps calibration and history, and remembers the choice", () => {
  localStorage.setItem("sonora-language", "zh-CN");
  const settings = JSON.stringify({
    offset: 97,
    threshold: 75,
    response: "fast",
  });
  const history = JSON.stringify([
    {
      id: "existing",
      startedAt: "2026-10-09T06:00:00Z",
      duration: 60,
      source: "mic",
      average: 60,
      min: 55,
      max: 65,
      offset: 97,
      threshold: 75,
    },
  ]);
  localStorage.setItem("sonora-settings", settings);
  localStorage.setItem("sonora-history", history);
  const view = renderApp();
  fireEvent.click(screen.getByRole("button", { name: "试用演示" }));
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  const reading = document.querySelector(".db-value")?.textContent;
  expect(reading).not.toBe("—");
  fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));
  expect(
    screen.getByRole("button", { name: "Pause", exact: true }),
  ).toBeTruthy();
  expect(document.querySelector(".db-value")?.textContent).toBe(reading);
  expect(document.documentElement.lang).toBe("en");
  expect(document.title).toBe("Sonora · Live sound level monitor");
  expect(localStorage.getItem("sonora-settings")).toBe(settings);
  expect(localStorage.getItem("sonora-history")).toBe(history);

  fireEvent.click(screen.getByRole("button", { name: "Set alert" }));
  const picker = screen.getByRole("combobox", {
    name: "Language",
  }) as HTMLSelectElement;
  expect(picker.disabled).toBe(false);
  expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("97");
  expect(
    (screen.getByRole("button", { name: "Save settings" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.change(picker, { target: { value: "zh-CN" } });
  expect(screen.getByRole("heading", { name: "让测量更适合你" })).toBeTruthy();
  fireEvent.change(picker, { target: { value: "en" } });
  fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(document.querySelector(".db-value")?.textContent).not.toBe(reading);
  fireEvent.click(screen.getByRole("button", { name: "Pause", exact: true }));
  expect(
    screen.getByRole("button", { name: "Resume", exact: true }),
  ).toBeTruthy();
  view.unmount();
  renderApp();
  expect(screen.getByRole("button", { name: "Start monitoring" })).toBeTruthy();
  expect(localStorage.getItem("sonora-language")).toBe("en");
  expect(localStorage.getItem("sonora-history")).toBe(history);
});
