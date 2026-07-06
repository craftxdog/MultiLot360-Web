import type { DrawShift } from "../types/draws.types";

export const DRAW_TIME_ZONE = "America/Managua";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export type DrawShiftTimingPhase =
  | "open"
  | "overdue"
  | "blocked"
  | "closed";

export type DrawShiftTiming = {
  phase: DrawShiftTimingPhase;
  scheduledAt: Date;
  cutoffAt: Date;
  stateChangedAt: Date;
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
};

function readDateParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return values as DateParts;
}

export function toDrawDateTime(
  date: string,
  time: string,
  timeZone = DRAW_TIME_ZONE,
) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  const utcGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second),
  );
  const zoned = readDateParts(utcGuess, timeZone);
  const offset =
    Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second,
    ) - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offset);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getDrawShiftTiming(
  shift: DrawShift,
  now: number,
): DrawShiftTiming {
  const scheduledAt = toDrawDateTime(
    shift.date,
    shift.configuration.time,
  );
  const cutoffAt = new Date(
    scheduledAt.getTime() - shift.configuration.lockSecondsBefore * 1_000,
  );
  const createdAt = new Date(shift.createdAt);
  const updatedAt = new Date(shift.updatedAt);
  const stateChangedAt =
    updatedAt.getTime() - createdAt.getTime() > 1_000 ? updatedAt : createdAt;
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - stateChangedAt.getTime()) / 1_000),
  );
  const remainingSeconds = Math.ceil(
    (cutoffAt.getTime() - now) / 1_000,
  );
  const operatingWindow = cutoffAt.getTime() - stateChangedAt.getTime();
  const progress =
    operatingWindow <= 0
      ? 100
      : clamp(
          ((now - stateChangedAt.getTime()) / operatingWindow) * 100,
          0,
          100,
        );

  const phase: DrawShiftTimingPhase =
    shift.status === "CERRADO"
      ? "closed"
      : shift.status === "BLOQUEO"
        ? "blocked"
        : remainingSeconds > 0
          ? "open"
          : "overdue";

  return {
    phase,
    scheduledAt,
    cutoffAt,
    stateChangedAt,
    elapsedSeconds,
    remainingSeconds,
    progress,
  };
}

export function formatClockDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(Math.abs(seconds)));
  const days = Math.floor(safeSeconds / 86_400);
  const hours = Math.floor((safeSeconds % 86_400) / 3_600);
  const minutes = Math.floor((safeSeconds % 3_600) / 60);
  const remaining = safeSeconds % 60;
  const clock = [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return days > 0 ? `${days}d ${clock}` : clock;
}

export function formatDrawDateTime(
  date: Date,
  timeZone = DRAW_TIME_ZONE,
) {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
