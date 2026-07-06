"use client";

import { CalendarClock, LockKeyhole, Timer } from "lucide-react";
import type { DrawShift } from "@/features/draws/types/draws.types";
import { formatClockDuration, formatDrawDateTime, getDrawShiftTiming } from "@/features/draws/utils/draw-shift-timing";
import { formatSalesShiftLabel } from "../utils/sales-shift";

export function SaleShiftClock({ shift, now, automatic }: { shift: DrawShift; now: number; automatic: boolean }) {
  const timing = getDrawShiftTiming(shift, now);
  const remaining = Math.max(0, timing.remainingSeconds);

  return <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4" aria-label="Turno activo de venta">
    <div className="absolute inset-x-0 top-0 h-0.5 bg-muted"><div className="h-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${timing.progress}%` }} /></div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-500/20 bg-background text-emerald-700 dark:text-emerald-300">{automatic ? <LockKeyhole className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}</span>
        <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{automatic ? "Turno fijado automáticamente" : "Turno seleccionado"}</p><p className="mt-1 truncate text-sm font-semibold text-foreground">{formatSalesShiftLabel(shift)}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Corte {formatDrawDateTime(timing.cutoffAt)} · Sorteo {formatDrawDateTime(timing.scheduledAt)}</p></div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 rounded-xl border border-border bg-background/85 px-4 py-3 sm:min-w-44">
        <span className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><Timer className="h-3.5 w-3.5" />Cierra en</span>
        <time dateTime={timing.cutoffAt.toISOString()} className="font-mono text-lg font-semibold tabular-nums text-foreground" aria-live="off">{formatClockDuration(remaining)}</time>
      </div>
    </div>
  </section>;
}
