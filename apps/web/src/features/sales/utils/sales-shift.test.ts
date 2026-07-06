import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DrawShift } from "@/features/draws/types/draws.types";
import { getSaleableSalesShifts, selectCurrentSalesShift } from "./sales-shift";

function shift(time: string, status: DrawShift["status"] = "ABIERTO"): DrawShift {
  return {
    id: `shift-${time}`,
    date: "2026-07-01",
    status,
    createdAt: "2026-07-01T11:00:00.000Z",
    updatedAt: "2026-07-01T11:00:00.000Z",
    configuration: {
      id: `configuration-${time}`,
      code: `loto-${time}`,
      time: `${time}:00`,
      tuesdayOnly: false,
      lockSecondsBefore: 60,
      reopenSecondsAfter: 600,
      active: true,
      createdAt: "2026-06-01T12:00:00.000Z",
      updatedAt: "2026-06-01T12:00:00.000Z",
    },
  };
}

const shifts = [shift("21:00"), shift("15:00"), shift("11:00"), shift("18:00")];

describe("sales shift selection", () => {
  it("uses only the 11 AM, 3 PM and 9 PM operational schedule", () => {
    const saleable = getSaleableSalesShifts(shifts, new Date("2026-07-01T15:00:00.000Z").getTime());
    assert.deepEqual(saleable.map((item) => item.configuration.time.slice(0, 5)), ["11:00", "15:00", "21:00"]);
  });

  it("automatically advances to the next shift after cutoff", () => {
    const current = selectCurrentSalesShift(shifts, new Date("2026-07-01T18:00:00.000Z").getTime());
    assert.equal(current?.configuration.time.slice(0, 5), "15:00");
  });

  it("never selects a blocked shift", () => {
    const current = selectCurrentSalesShift([shift("11:00", "BLOQUEO"), shift("15:00")], new Date("2026-07-01T15:00:00.000Z").getTime());
    assert.equal(current?.configuration.time.slice(0, 5), "15:00");
  });
});
