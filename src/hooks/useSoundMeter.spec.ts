import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSoundMeter } from "./useSoundMeter";
import { defaultSettings } from "../lib/storage";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
vi.mock("@capacitor/app", () => ({ App: { addListener: vi.fn() } }));

let getUserMedia: ReturnType<typeof vi.fn>;
let track: {
  enabled: boolean;
  readyState: string;
  label: string;
  onended: null | (() => void);
  stop: ReturnType<typeof vi.fn>;
};
let media: {
  getTracks: () => (typeof track)[];
  getAudioTracks: () => (typeof track)[];
};
const contexts: FakeAudioContext[] = [];

class FakeAudioContext {
  state = "running";
  resume = vi.fn(async () => {
    this.state = "running";
  });
  suspend = vi.fn(async () => {
    this.state = "suspended";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });
  constructor() {
    contexts.push(this);
  }
  createAnalyser() {
    return {
      fftSize: 2048,
      smoothingTimeConstant: 0,
      getFloatTimeDomainData: (buffer: Float32Array) => {
        // A known 0.01 RMS signal: -40 dBFS, 54 estimated dB with default offset.
        for (let i = 0; i < buffer.length; i++)
          buffer[i] = i % 2 ? 0.01 : -0.01;
      },
    };
  }
  createMediaStreamSource() {
    return { connect: vi.fn() };
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
  contexts.length = 0;
  track = {
    enabled: true,
    readyState: "live",
    label: "Test microphone",
    onended: null,
    stop: vi.fn(),
  };
  media = { getTracks: () => [track], getAudioTracks: () => [track] };
  getUserMedia = vi.fn().mockResolvedValue(media);
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  vi.stubGlobal("AudioContext", FakeAudioContext);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("microphone measurement lifecycle", () => {
  it("pauses on Android lifecycle events even when document visibility has not changed", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    let onState!: (state: { isActive: boolean }) => void;
    const remove = vi.fn(async () => {});
    vi.mocked(NativeApp.addListener).mockImplementation(((
      _event: string,
      handler: typeof onState,
    ) => {
      onState = handler;
      return Promise.resolve({ remove });
    }) as typeof NativeApp.addListener);
    const { result, unmount } = renderHook(() =>
      useSoundMeter(defaultSettings),
    );
    await act(async () => {
      await result.current.start("mic");
    });
    act(() => {
      vi.advanceTimersByTime(500);
      onState({ isActive: false });
    });
    expect(document.hidden).toBe(false);
    expect(result.current.status).toBe("paused");
    expect(track.enabled).toBe(false);
    expect(result.current.error).toContain("后台");
    await act(async () => {
      unmount();
    });
    expect(remove).toHaveBeenCalledOnce();
  });
  it("measures a known signal, excludes paused time and releases audio on finish", async () => {
    const { result } = renderHook(() => useSoundMeter(defaultSettings));
    await act(async () => {
      await result.current.start("mic");
    });
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.db).toBeCloseTo(54, 4);
    expect(result.current.average).toBeCloseTo(54, 4);
    expect(result.current.duration).toBeCloseTo(1.5);
    expect(result.current.points.length).toBeGreaterThan(0);
    act(() => {
      result.current.pause();
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.status).toBe("paused");
    expect(track.enabled).toBe(false);
    expect(result.current.duration).toBeCloseTo(1.5);
    await act(async () => {
      await result.current.resume();
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(track.enabled).toBe(true);
    let record: ReturnType<typeof result.current.stop> = null;
    act(() => {
      record = result.current.stop();
    });
    expect(record).toMatchObject({ source: "mic", offset: 94, threshold: 70 });
    expect(record!.duration).toBeCloseTo(2);
    expect(track.stop).toHaveBeenCalledOnce();
    expect(contexts[0].close).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("idle");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.duration).toBeCloseTo(2);
  });

  it("clears old demo values when a real microphone request is denied", async () => {
    const { result } = renderHook(() => useSoundMeter(defaultSettings));
    await act(async () => {
      await result.current.start("demo");
    });
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.stop();
    });
    expect(result.current.db).not.toBeNull();
    getUserMedia.mockRejectedValue(
      new DOMException("Denied", "NotAllowedError"),
    );
    await act(async () => {
      await result.current.start("mic");
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.db).toBeNull();
    expect(result.current.error).toContain("麦克风权限未开启");
    expect(contexts[0].close).toHaveBeenCalled();
  });

  it("cancels pending permission and stops a stream that arrives after cancellation", async () => {
    let allow!: (value: typeof media) => void;
    getUserMedia.mockImplementation(
      () =>
        new Promise((resolve) => {
          allow = resolve;
        }),
    );
    const { result } = renderHook(() => useSoundMeter(defaultSettings));
    await act(async () => {
      void result.current.start("mic");
    });
    expect(result.current.status).toBe("requesting");
    act(() => {
      result.current.stop();
    });
    await act(async () => {
      allow(media);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.db).toBeNull();
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("pauses in the background and prevents resuming a disconnected microphone", async () => {
    const { result } = renderHook(() => useSoundMeter(defaultSettings));
    await act(async () => {
      await result.current.start("mic");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.status).toBe("paused");
    expect(result.current.error).toContain("后台");
    track.readyState = "ended";
    await act(async () => {
      await result.current.resume();
    });
    expect(result.current.status).toBe("paused");
    expect(result.current.error).toContain("连接已中断");
  });

  it("does not restart a stopped session when a pending resume completes", async () => {
    const { result } = renderHook(() => useSoundMeter(defaultSettings));
    await act(async () => {
      await result.current.start("mic");
    });
    act(() => {
      vi.advanceTimersByTime(500);
      result.current.pause();
    });
    let complete!: () => void;
    contexts[0].resume.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    await act(async () => {
      void result.current.resume();
    });
    act(() => {
      result.current.stop();
    });
    await act(async () => {
      complete();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.duration).toBeCloseTo(0.5);
  });
});
