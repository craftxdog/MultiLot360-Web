"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DateRangeValue = {
  from?: string;
  to?: string;
};

const formatter = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("es-NI", { month: "long", year: "numeric", timeZone: "UTC" });
const weekdays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

/** A viewport-bounded surface; its exact position is computed from the trigger. */
export const dateRangePickerPanelClass =
  "fixed z-50 overflow-y-auto rounded-2xl border border-border bg-background p-3 shadow-2xl";

function toDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function preset(days: number) {
  const to = toDate(todayKey()) ?? new Date();
  return { from: toKey(addDays(to, -(days - 1))), to: toKey(to) };
}

function formatRange(range: DateRangeValue, placeholder: string) {
  const from = toDate(range.from);
  const to = toDate(range.to);
  if (from && to) return `${formatter.format(from)} — ${formatter.format(to)}`;
  if (from) return `${formatter.format(from)} — …`;
  return placeholder;
}

function monthDays(month: Date) {
  const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
  const cells: Array<Date | null> = Array.from({ length: start.getUTCDay() }, () => null);
  for (let day = 1; day <= end.getUTCDate(); day++) cells.push(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function compare(left?: string, right?: string) {
  if (!left || !right) return 0;
  return left.localeCompare(right);
}

function normalizeRange(range: DateRangeValue): DateRangeValue {
  if (range.from && range.to && compare(range.from, range.to) > 0) return { from: range.to, to: range.from };
  return range;
}

function DateRangePickerInner({
  fromName,
  toName,
  initialRange,
  placeholder,
  allowClear,
  required,
  className,
  onChange,
}: {
  fromName?: string;
  toName?: string;
  initialRange: DateRangeValue;
  placeholder: string;
  allowClear: boolean;
  required: boolean;
  className?: string;
  onChange?: (range: DateRangeValue) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState(() => normalizeRange(initialRange));
  const [month, setMonth] = React.useState(() => toDate(initialRange.from) ?? toDate(todayKey()) ?? new Date());
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties>();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node) || dialogRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open) return;

    const positionPanel = () => {
      const trigger = triggerRef.current;
      const dialog = dialogRef.current;
      if (!trigger || !dialog) return;

      const margin = 16;
      const gap = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(720, viewportWidth - margin * 2);
      const left = Math.min(
        Math.max(margin, trigger.getBoundingClientRect().left),
        Math.max(margin, viewportWidth - width - margin),
      );
      const triggerRect = trigger.getBoundingClientRect();
      const below = viewportHeight - triggerRect.bottom - gap - margin;
      const above = triggerRect.top - gap - margin;
      const placeAbove = dialog.scrollHeight > below && above > below;
      const maxHeight = Math.max(0, placeAbove ? above : below);
      const height = Math.min(dialog.scrollHeight, maxHeight);

      setPanelStyle({
        left,
        top: placeAbove ? Math.max(margin, triggerRect.top - gap - height) : Math.max(margin, triggerRect.bottom + gap),
        width,
        maxHeight,
      });
    };

    positionPanel();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [month, open]);

  function commit(next: DateRangeValue) {
    const normalized = normalizeRange(next);
    setRange(normalized);
    onChange?.(normalized);
  }

  function select(day: string) {
    if (!range.from || range.to) {
      commit({ from: day, to: undefined });
      return;
    }
    commit(compare(day, range.from) < 0 ? { from: day, to: range.from } : { from: range.from, to: day });
  }

  function applyPreset(days: number) {
    commit(preset(days));
    setMonth(toDate(preset(days).from) ?? month);
  }

  const months = [month, addMonths(month, 1)];
  const label = formatRange(range, placeholder);

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      {fromName ? <input type="hidden" name={fromName} value={range.from ?? ""} required={required} /> : null}
      {toName ? <input type="hidden" name={toName} value={range.to ?? ""} required={required} /> : null}
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-11 w-full items-center justify-start gap-2 rounded-xl border border-input bg-background px-4 text-left text-sm outline-none transition",
          "hover:bg-accent focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8",
          !range.from && "text-muted-foreground",
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div ref={dialogRef} role="dialog" aria-label="Seleccionar rango de fechas" className={dateRangePickerPanelClass} style={panelStyle}>
          <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {[7, 14, 30].map((days) => <Button key={days} type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={() => applyPreset(days)}>{days} días</Button>)}
              {allowClear ? <Button type="button" variant="ghost" className="h-8 gap-1 px-3 text-xs" onClick={() => commit({})}><X className="h-3.5 w-3.5" />Limpiar</Button> : null}
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Button type="button" variant="ghost" className="h-8 w-8 px-0" aria-label="Mes anterior" onClick={() => setMonth((value) => addMonths(value, -1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" className="h-8 w-8 px-0" aria-label="Mes siguiente" onClick={() => setMonth((value) => addMonths(value, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {months.map((currentMonth) => (
              <div key={toKey(currentMonth)}>
                <p className="px-2 text-center text-sm font-medium capitalize">{monthFormatter.format(currentMonth)}</p>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
                  {weekdays.map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {monthDays(currentMonth).map((date, index) => {
                    if (!date) return <span key={`blank-${index}`} />;
                    const key = toKey(date);
                    const selectedStart = key === range.from;
                    const selectedEnd = key === range.to;
                    const inRange = Boolean(range.from && range.to && compare(key, range.from) >= 0 && compare(key, range.to) <= 0);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => select(key)}
                        className={cn(
                          "h-9 rounded-lg text-sm transition hover:bg-accent",
                          inRange && "bg-primary/10 text-primary",
                          (selectedStart || selectedEnd) && "bg-primary text-primary-foreground hover:bg-primary",
                        )}
                      >
                        {date.getUTCDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <Button type="button" className="h-9" onClick={() => setOpen(false)}>Aplicar rango</Button>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

export function DateRangePicker({
  fromName,
  toName,
  from,
  to,
  placeholder = "Selecciona rango",
  allowClear = true,
  required = false,
  className,
  onChange,
}: {
  fromName?: string;
  toName?: string;
  from?: string;
  to?: string;
  placeholder?: string;
  allowClear?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (range: DateRangeValue) => void;
}) {
  const initialRange = normalizeRange({ from, to });
  return <DateRangePickerInner key={`${initialRange.from ?? ""}-${initialRange.to ?? ""}`} fromName={fromName} toName={toName} initialRange={initialRange} placeholder={placeholder} allowClear={allowClear} required={required} className={className} onChange={onChange} />;
}
