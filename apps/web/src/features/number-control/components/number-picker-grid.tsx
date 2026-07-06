"use client";

import { Eraser, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const LOTTERY_NUMBERS = Array.from({ length: 100 }, (_, index) => String(index).padStart(2, "0"));

export function NumberPickerGrid({ value, onChange, disabled, max = 100 }: { value: string[]; onChange: (value: string[]) => void; disabled?: boolean; max?: number }) {
  const selected = new Set(value);

  function toggle(number: string) {
    if (selected.has(number)) onChange(value.filter((item) => item !== number));
    else if (value.length < max) onChange([...value, number].sort());
  }

  return (
    <fieldset disabled={disabled} className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
      <legend className="sr-only">Selecciona números</legend>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-amber-500" /><span><strong className="text-foreground">{value.length}</strong> seleccionados</span></div>
        <button type="button" disabled={value.length === 0} onClick={() => onChange([])} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-30"><Eraser className="h-3.5 w-3.5" />Limpiar</button>
      </div>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {LOTTERY_NUMBERS.map((number) => {
          const active = selected.has(number);
          return <button key={number} type="button" aria-pressed={active} aria-label={`${active ? "Quitar" : "Seleccionar"} número ${number}`} onClick={() => toggle(number)} className={cn("aspect-square min-w-0 rounded-md border font-mono text-[10px] tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 sm:rounded-lg sm:text-xs", active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground")}>{number}</button>;
        })}
      </div>
    </fieldset>
  );
}
