"use client";

import { AlertTriangle, CalendarClock, Clock3, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DrawShift } from "../../types/draws.types";
import {
  formatClockDuration,
  formatDrawDateTime,
  getDrawShiftTiming,
} from "../../utils/draw-shift-timing";
import { DrawShiftStatusBadge } from "./draw-shift-status-badge";
import { DrawShiftActionsCell } from "./draw-shift-actions-cell";

type DrawActiveShiftCardProps = {
  shift: DrawShift;
  now?: number;
  canUpdate: boolean;
};

const phaseStyles = {
  open: {
    label: "Cierra en",
    tone: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    icon: Timer,
  },
  overdue: {
    label: "Corte vencido hace",
    tone: "text-danger",
    bar: "bg-danger",
    icon: AlertTriangle,
  },
  blocked: {
    label: "Bloqueado hace",
    tone: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    icon: Clock3,
  },
  closed: {
    label: "Cerrado hace",
    tone: "text-muted-foreground",
    bar: "bg-muted-foreground",
    icon: Clock3,
  },
} as const;

export function DrawActiveShiftCard({
  shift,
  now,
  canUpdate,
}: DrawActiveShiftCardProps) {
  const timing = now === undefined ? null : getDrawShiftTiming(shift, now);
  const phase = timing?.phase ?? (shift.status === "BLOQUEO" ? "blocked" : "open");
  const presentation = phaseStyles[phase];
  const TimingIcon = presentation.icon;
  const primarySeconds =
    phase === "open"
      ? timing?.remainingSeconds
      : phase === "overdue"
        ? Math.abs(timing?.remainingSeconds ?? 0)
        : timing?.elapsedSeconds;
  const progressStyle = { width: `${timing?.progress ?? 0}%` };

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:border-foreground/15"
      data-state={phase}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-0.5", presentation.bar)}
        aria-hidden="true"
      />

      <div className="p-5 sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Sorteo
            </p>
            <h3 className="mt-1 truncate text-lg font-medium tracking-[-0.03em] text-foreground">
              {shift.configuration.code}
            </h3>
          </div>
          <DrawShiftStatusBadge status={shift.status} />
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1.25fr_1fr]">
          <div className="rounded-xl border border-border bg-muted/45 p-4">
            <div className={cn("flex items-center gap-2 text-xs", presentation.tone)}>
              <TimingIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {presentation.label}
            </div>
            <time
              dateTime={timing?.cutoffAt.toISOString()}
              className="mt-2 block font-mono text-2xl font-medium tabular-nums tracking-[-0.04em] text-foreground"
              aria-live="off"
            >
              {primarySeconds === undefined
                ? "--:--:--"
                : formatClockDuration(primarySeconds)}
            </time>
          </div>

          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {phase === "open" || phase === "overdue"
                ? "Abierto hace"
                : "Último cambio"}
            </div>
            <p className="mt-2 font-mono text-lg tabular-nums text-foreground">
              {timing ? formatClockDuration(timing.elapsedSeconds) : "--:--:--"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Corte {timing ? formatDrawDateTime(timing.cutoffAt) : "--:--"}
            </span>
            <span>
              Sorteo {timing ? formatDrawDateTime(timing.scheduledAt) : shift.configuration.time.slice(0, 5)}
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`Progreso del turno ${shift.configuration.code}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(timing?.progress ?? 0)}
          >
            <div
              className={cn("h-full rounded-full transition-[width] duration-700", presentation.bar)}
              style={progressStyle}
            />
          </div>
        </div>
      </div>

      <footer className="flex min-h-14 items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {shift.date}
        </p>
        <DrawShiftActionsCell
          row={{
            id: shift.id,
            status: shift.status,
            configurationCode: shift.configuration.code,
          }}
          canUpdate={canUpdate}
          showLabels
        />
      </footer>
    </article>
  );
}
