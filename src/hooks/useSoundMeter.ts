import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import {
  calculateRms,
  energyAverage,
  microphoneError,
  rmsToDbfs,
} from "../lib/audio";
import type { SessionRecord, Settings } from "../lib/storage";

export type ChartPoint = { time: number; db: number };
type Snapshot = {
  db: number | null;
  dbfs: number | null;
  min: number | null;
  max: number | null;
  average: number | null;
  duration: number;
  points: ChartPoint[];
};
const empty: Snapshot = {
  db: null,
  dbfs: null,
  min: null,
  max: null,
  average: null,
  duration: 0,
  points: [],
};
type Status = "idle" | "requesting" | "running" | "paused";

export function useSoundMeter(settings: Settings) {
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [status, setStatus] = useState<Status>("idle");
  const [source, setSource] = useState<"mic" | "demo">("mic");
  const [error, setError] = useState("");
  const [device, setDevice] = useState("默认麦克风");
  const state = useRef(empty);
  const active = useRef<Status>("idle");
  const selectedSource = useRef<"mic" | "demo">("mic");
  const stream = useRef<MediaStream | null>(null);
  const context = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const buffer = useRef(new Float32Array(2048));
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const generation = useRef(0);
  const session = useRef({
    startedAt: "",
    settings,
    energy: 0,
    weight: 0,
    smoothed: -1,
    lastTick: 0,
    lastPoint: -1,
  });

  const stopTimer = useCallback(() => {
    if (interval.current !== null) clearInterval(interval.current);
    interval.current = null;
  }, []);

  const release = useCallback(() => {
    stopTimer();
    stream.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    stream.current = null;
    if (context.current) void context.current.close().catch(() => {});
    context.current = null;
    analyser.current = null;
  }, [stopTimer]);

  const tick = useCallback(() => {
    if (active.current !== "running") return;
    const current = session.current;
    const now = performance.now();
    const delta = Math.min((now - current.lastTick) / 1000, 0.5);
    current.lastTick = now;
    if (delta <= 0) return;
    const duration = state.current.duration + delta;
    let dbfs: number;
    let db: number;
    if (selectedSource.current === "demo") {
      db =
        43 +
        5 * Math.sin(duration * 0.45) +
        3 * Math.sin(duration * 1.7) +
        2 * Math.sin(duration * 4.1) +
        21 * Math.max(0, Math.sin(duration * 0.16 - 1)) ** 10;
      dbfs = db - current.settings.offset;
    } else {
      if (!analyser.current) return;
      analyser.current.getFloatTimeDomainData(buffer.current);
      const rms = calculateRms(buffer.current);
      const energy = rms * rms;
      const alpha =
        1 -
        Math.exp(-delta / (current.settings.response === "slow" ? 1 : 0.125));
      current.smoothed =
        current.smoothed < 0
          ? energy
          : current.smoothed + alpha * (energy - current.smoothed);
      dbfs = rmsToDbfs(Math.sqrt(current.smoothed));
      db = Math.max(0, dbfs + current.settings.offset);
    }
    current.energy += 10 ** (db / 10) * delta;
    current.weight += delta;
    let points = state.current.points;
    if (duration - current.lastPoint >= 0.45) {
      points = [
        ...points.filter((point) => point.time >= duration - 60),
        { time: duration, db },
      ];
      current.lastPoint = duration;
    }
    const next = {
      db,
      dbfs,
      duration,
      points,
      min: Math.min(state.current.min ?? db, db),
      max: Math.max(state.current.max ?? db, db),
      average: energyAverage(current.energy, current.weight),
    };
    state.current = next;
    setSnapshot(next);
  }, []);

  const runTimer = useCallback(() => {
    session.current.lastTick = performance.now();
    active.current = "running";
    setStatus("running");
    stopTimer();
    interval.current = setInterval(tick, 100);
  }, [stopTimer, tick]);

  const pause = useCallback(() => {
    if (active.current !== "running") return;
    tick();
    stopTimer();
    active.current = "paused";
    setStatus("paused");
    stream.current?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    if (context.current?.state === "running")
      void context.current.suspend().catch(() => {});
  }, [stopTimer, tick]);

  const start = useCallback(
    async (nextSource: "mic" | "demo") => {
      if (
        active.current === "requesting" ||
        active.current === "running" ||
        active.current === "paused"
      )
        return;
      const token = ++generation.current;
      release();
      state.current = { ...empty, points: [] };
      setSnapshot(state.current);
      active.current = "requesting";
      setStatus("requesting");
      setError("");
      setSource(nextSource);
      selectedSource.current = nextSource;
      try {
        if (nextSource === "mic") {
          if (
            !window.isSecureContext ||
            !navigator.mediaDevices?.getUserMedia
          ) {
            throw new Error(
              "麦克风需要安全连接。请通过 localhost 或 HTTPS 打开此应用，并使用支持麦克风的现代浏览器。",
            );
          }
          const audio = new AudioContext();
          context.current = audio;
          await audio.resume();
          if (token !== generation.current) {
            void audio.close().catch(() => {});
            return;
          }
          const media = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
            video: false,
          });
          if (token !== generation.current) {
            media.getTracks().forEach((track) => track.stop());
            return;
          }
          stream.current = media;
          const node = audio.createAnalyser();
          node.fftSize = 2048;
          node.smoothingTimeConstant = 0;
          analyser.current = node;
          audio.createMediaStreamSource(media).connect(node);
          const track = media.getAudioTracks()[0];
          setDevice(track?.label || "默认麦克风");
          track.onended = () => {
            pause();
            setError(
              "麦克风连接已中断。请结束本次测量，重新连接设备后再开始。",
            );
          };
        } else setDevice("模拟声音信号");
        state.current = { ...empty, points: [] };
        setSnapshot(state.current);
        session.current = {
          startedAt: new Date().toISOString(),
          settings: { ...settings },
          energy: 0,
          weight: 0,
          smoothed: -1,
          lastTick: 0,
          lastPoint: -1,
        };
        runTimer();
      } catch (caught) {
        if (token !== generation.current) return;
        release();
        active.current = "idle";
        setStatus("idle");
        setError(
          microphoneError(caught, Capacitor.getPlatform() === "android"),
        );
      }
    },
    [pause, release, runTimer, settings],
  );

  const resume = useCallback(async () => {
    if (active.current !== "paused") return;
    const token = generation.current;
    if (
      selectedSource.current === "mic" &&
      !stream.current
        ?.getAudioTracks()
        .some((track) => track.readyState === "live")
    ) {
      setError("麦克风连接已中断，请结束本次测量后重新开始。");
      return;
    }
    try {
      stream.current?.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      await context.current?.resume();
      if (token !== generation.current || active.current !== "paused") return;
      setError("");
      runTimer();
    } catch (caught) {
      setError(microphoneError(caught, Capacitor.getPlatform() === "android"));
    }
  }, [runTimer]);

  const stop = useCallback((): SessionRecord | null => {
    if (active.current === "idle") return null;
    if (active.current === "running") tick();
    ++generation.current;
    release();
    active.current = "idle";
    setStatus("idle");
    setError("");
    const data = state.current;
    if (data.average === null || data.min === null || data.max === null)
      return null;
    return {
      id: crypto.randomUUID(),
      startedAt: session.current.startedAt,
      duration: data.duration,
      average: data.average,
      min: data.min,
      max: data.max,
      source: selectedSource.current,
      offset: session.current.settings.offset,
      threshold: session.current.settings.threshold,
    };
  }, [release, tick]);

  useEffect(() => {
    const pauseInBackground = () => {
      if (active.current === "running") {
        pause();
        setError("已进入后台，测量已自动暂停。返回后可继续测量。");
      }
    };
    const onHidden = () => {
      if (document.hidden) pauseInBackground();
    };
    document.addEventListener("visibilitychange", onHidden);
    const nativeListener = Capacitor.isNativePlatform()
      ? NativeApp.addListener("appStateChange", ({ isActive }) => {
          if (!isActive) pauseInBackground();
        })
      : null;
    return () => {
      ++generation.current;
      release();
      document.removeEventListener("visibilitychange", onHidden);
      void nativeListener?.then((listener) => listener.remove());
    };
  }, [pause, release]);

  return {
    ...snapshot,
    status,
    source,
    error,
    device,
    start,
    pause,
    resume,
    stop,
    clearError: () => setError(""),
  };
}
