import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateRms,
  rmsToDbfs,
  energyAverage,
  getSoundLevel,
  formatDuration,
  microphoneError,
} from "./audio.ts";
test("RMS measures AC energy and removes DC offset", () => {
  assert.equal(calculateRms(new Float32Array([0.5, 0.5, 0.5])), 0);
  assert.equal(calculateRms(new Float32Array([1, -1, 1, -1])), 1);
  const signal = Float32Array.from({ length: 4800 }, (_, i) =>
    Math.sin((2 * Math.PI * i) / 48),
  );
  assert.ok(Math.abs(calculateRms(signal) - Math.SQRT1_2) < 1e-6);
});
test("amplitude conversion preserves logarithmic scale and handles silence", () => {
  assert.equal(rmsToDbfs(1), 0);
  assert.equal(rmsToDbfs(0.1), -20);
  assert.equal(rmsToDbfs(0), -120);
  assert.equal(calculateRms(new Float32Array()), 0);
});
test("average uses energy rather than arithmetic mean of decibels", () => {
  const average = energyAverage(10 ** 4 + 10 ** 6, 2);
  assert.ok(Math.abs(average - 57.0329) < 0.001);
  assert.equal(energyAverage(0, 0), 0);
});
test("level boundaries, elapsed time and permission errors are readable", () => {
  assert.equal(getSoundLevel(34.9).label, "非常安静");
  assert.equal(getSoundLevel(55).label, "日常声量");
  assert.equal(getSoundLevel(85).label, "声音较大");
  assert.equal(formatDuration(65), "01:05");
  assert.equal(formatDuration(3661), "01:01:01");
  assert.match(
    microphoneError(new DOMException("", "NotAllowedError")),
    /权限/,
  );
  assert.match(
    microphoneError(new DOMException("", "NotAllowedError"), true),
    /手机/,
  );
});
