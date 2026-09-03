import type { DrawShift } from "@/features/draws/types/draws.types";
import { getDrawShiftTiming } from "@/features/draws/utils/draw-shift-timing";

/**
 * A tenant owns its draw schedule.  Sales must not assume AlphaBy's legacy
 * 11:00/15:00/21:00 times: custom configurations (for example 17:00) are
 * valid as long as the API returned the shift for this tenant.
 */
export function isSupportedSalesShift(shift: DrawShift) {
  return shift.status === "ABIERTO" || shift.status === "BLOQUEO";
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
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  const displayHour = hour % 12 || 12;
  const label = `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
  return `${shift.configuration.code} · ${label}`;
}
