"use client";

import * as React from "react";
import type { TooltipContentProps, TooltipValueType } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, {
  label: string;
  color: string;
  valueFormatter?: (value: number) => string;
}>;

function formatTooltipValue(value: TooltipValueType | undefined, formatter?: (value: number) => string) {
  const raw = Array.isArray(value) ? value[0] : value;
  const number = typeof raw === "number" ? raw : Number(raw);
  if (Number.isFinite(number)) return formatter ? formatter(number) : new Intl.NumberFormat("es-NI", { maximumFractionDigits: 2 }).format(number);
  return String(raw ?? "—");
}

export function ChartContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("h-[320px] w-full text-xs text-muted-foreground", className)}>{children}</div>;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  labelFormatter,
}: Partial<TooltipContentProps<TooltipValueType, string>> & {
  config: ChartConfig;
  labelFormatter?: (label: string | number | undefined) => string;
}) {
  if (!active || !payload?.length) return null;

  return <div className="min-w-48 rounded-2xl border border-border bg-card/95 p-3 text-card-foreground shadow-2xl backdrop-blur">
    <p className="text-xs font-medium text-foreground">{labelFormatter ? labelFormatter(label) : label ?? "Detalle"}</p>
    <div className="mt-3 space-y-2">
      {payload.filter((item) => !item.hide).map((item) => {
        const key = String(item.dataKey ?? item.name ?? "");
        const itemConfig = config[key];
        return <div key={key} className="flex items-center justify-between gap-4 text-xs">
          <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: itemConfig?.color ?? item.color ?? item.fill }} />
            <span className="truncate">{itemConfig?.label ?? item.name ?? key}</span>
          </span>
          <span className="font-mono font-medium text-foreground">{formatTooltipValue(item.value, itemConfig?.valueFormatter)}</span>
        </div>;
      })}
    </div>
  </div>;
}

export function ChartLegend({ config, keys, className }: { config: ChartConfig; keys: string[]; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground", className)}>
    {keys.map((key) => <span key={key} className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config[key]?.color }} />
      {config[key]?.label ?? key}
    </span>)}
  </div>;
}
