import type { DrawShift } from "@/features/draws/types/draws.types";
import { getDrawShiftTiming } from "@/features/draws/utils/draw-shift-timing";

export const SALES_SHIFT_TIMES = ["11:00", "15:00", "21:00"] as const;

export function isSupportedSalesShift(shift: DrawShift) {
  return SALES_SHIFT_TIMES.includes(
    shift.configuration.time.slice(0, 5) as (typeof SALES_SHIFT_TIMES)[number],
  );
}

export function getSaleableSalesShifts(shifts: DrawShift[], now: number) {
  return shifts
    .filter((shift) => isSupportedSalesShift(shift))
    .filter((shift) => getDrawShiftTiming(shift, now).phase === "open")
    .sort(
      (left, right) =>
        getDrawShiftTiming(left, now).cutoffAt.getTime() -
        getDrawShiftTiming(right, now).cutoffAt.getTime(),
    );
}

export function selectCurrentSalesShift(shifts: DrawShift[], now: number) {
  return getSaleableSalesShifts(shifts, now)[0] ?? null;
}

export function formatSalesShiftLabel(shift: DrawShift) {
  const time = shift.configuration.time.slice(0, 5);
  const label = time === "11:00" ? "11:00 a. m." : time === "15:00" ? "3:00 p. m." : "9:00 p. m.";
  return `${shift.configuration.code} · ${label}`;
}
