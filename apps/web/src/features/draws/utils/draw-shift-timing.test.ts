import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DrawShift } from "../types/draws.types";
import {
  formatClockDuration,
  getDrawShiftTiming,
  toDrawDateTime,
} from "./draw-shift-timing";

const shift: DrawShift = {
  id: "0d4e12fc-7ac7-4bc6-9faf-248d1d9f3a6f",
  date: "2026-06-29",
  status: "ABIERTO",
  createdAt: "2026-06-29T16:00:00.000Z",
  updatedAt: "2026-06-29T16:00:00.000Z",
  configuration: {
    id: "8d79c454-e4aa-45f7-a084-5d56f6d0a710",
    code: "11am",
    time: "11:00:00",
    tuesdayOnly: false,
    lockSecondsBefore: 60,
    reopenSecondsAfter: 600,
    active: true,
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-01T12:00:00.000Z",
  },
};

describe("draw shift timing", () => {
  it("converts the configured Managua wall time to a stable instant", () => {
    assert.equal(
      toDrawDateTime("2026-06-29", "11:00:00").toISOString(),
      "2026-06-29T17:00:00.000Z",
    );
  });

  it("calculates elapsed time, cutoff countdown and progress", () => {
    const timing = getDrawShiftTiming(
      shift,
      new Date("2026-06-29T16:30:00.000Z").getTime(),
    );

    assert.equal(timing.phase, "open");
    assert.equal(timing.cutoffAt.toISOString(), "2026-06-29T16:59:00.000Z");
    assert.equal(timing.elapsedSeconds, 1_800);
    assert.equal(timing.remainingSeconds, 1_740);
    assert.equal(Math.round(timing.progress), 51);
  });

  it("reports overdue and blocked phases without negative durations", () => {
    const overdue = getDrawShiftTiming(
      shift,
      new Date("2026-06-29T17:01:30.000Z").getTime(),
    );
    const blocked = getDrawShiftTiming(
      { ...shift, status: "BLOQUEO", updatedAt: "2026-06-29T16:55:00.000Z" },
      new Date("2026-06-29T17:00:00.000Z").getTime(),
    );

    assert.equal(overdue.phase, "overdue");
    assert.equal(overdue.remainingSeconds, -150);
    assert.equal(blocked.phase, "blocked");
    assert.equal(blocked.elapsedSeconds, 300);
    assert.equal(formatClockDuration(90_061), "1d 01:01:01");
  });
});
