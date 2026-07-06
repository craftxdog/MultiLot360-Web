"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { BarChart3, LineChart, TrendingUp } from "lucide-react";
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker";
import { reportOptions, sellerReportsOptions } from "@/features/operations/queries/operations.queries";

const compactMoney = new Intl.NumberFormat("es-NI", {
  compactDisplay: "short",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
  currency: "NIO",
});
const money = new Intl.NumberFormat("es-NI", { maximumFractionDigits: 2 });
const dayLabel = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", timeZone: "UTC" });

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultRange(): Required<DateRangeValue> {
  const to = todayKey();
  return { from: addDays(to, -6), to };
}

function datesBetween(from: string, to: string) {
  const result: string[] = [];
  for (let cursor = from; cursor <= to && result.length < 31; cursor = addDays(cursor, 1)) result.push(cursor);
  return result;
}

function formatDay(value: string) {
  return dayLabel.format(new Date(`${value}T00:00:00.000Z`));
}

function toCordobas(miles: number) {
  return miles * 1000;
}

function yFor(value: number, max: number) {
  return 76 - (value / Math.max(1, max)) * 58;
}

function movingAverage(values: number[]) {
  return values.map((_, index) => {
    const window = values.slice(Math.max(0, index - 2), index + 1);
    return window.reduce((sum, value) => sum + value, 0) / window.length;
  });
}

export function DashboardCharts({ admin, sellerId }: { admin: boolean; sellerId?: string }) {
  const [range, setRange] = useState<Required<DateRangeValue>>(defaultRange);
  const [hovered, setHovered] = useState<number | null>(null);
  const dates = useMemo(() => datesBetween(range.from, range.to), [range.from, range.to]);
  const trend = useQueries({ queries: dates.map((date) => ({ ...reportOptions({ dateFrom: date, dateUntil: date, ...(!admin && sellerId ? { sellerId } : {}) }), enabled: admin || Boolean(sellerId), staleTime: 30_000 })) });
  const sellers = useQuery({ ...sellerReportsOptions({ dateFrom: range.from, dateUntil: range.to, page: 1, limit: 8, sortBy: "netSalesMiles", sortDirection: "desc" }), enabled: admin, staleTime: 30_000 });
  const values = trend.map((query) => query.data?.netSalesMiles ?? 0);
  const averageValues = movingAverage(values);
  const max = Math.max(1, ...values, ...averageValues);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length ? total / values.length : 0;
  const best = values.reduce((winner, value, index) => value > winner.value ? { value, index } : winner, { value: 0, index: 0 });
  const activeIndex = hovered ?? (values.length ? values.length - 1 : 0);
  const activeDate = dates[activeIndex];
  const activeValue = values[activeIndex] ?? 0;
  const linePoints = averageValues.map((value, index) => {
    const x = dates.length > 1 ? 10 + (index * 80) / (dates.length - 1) : 50;
    return `${x},${yFor(value, max)}`;
  }).join(" ");
  const labelEvery = Math.max(1, Math.ceil(dates.length / 6));
  const sellerMax = Math.max(1, ...(sellers.data?.data.map((seller) => seller.netSalesMiles) ?? [1]));

  return <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]" aria-label="Gráficas operativas">
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><LineChart className="h-4 w-4" />Venta neta por día</p>
          <p className="mt-1 text-xs text-muted-foreground">{admin ? "Operación global" : "Sólo tu actividad"} · barras diarias y tendencia móvil</p>
        </div>
        <DateRangePicker className="lg:w-72" from={range.from} to={range.to} allowClear={false} onChange={(next) => next.from && next.to ? setRange({ from: next.from, to: next.to }) : undefined} placeholder="Rango de gráficas" />
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <Metric label="Total vendido" value={compactMoney.format(toCordobas(total))} helper={`${money.format(total)} mil`} />
        <Metric label="Promedio diario" value={compactMoney.format(toCordobas(average))} helper={`${dates.length} días analizados`} />
        <Metric label="Mejor día" value={dates[best.index] ? formatDay(dates[best.index]) : "—"} helper={compactMoney.format(toCordobas(best.value))} />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background/60 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Día seleccionado</p>
            <p className="mt-1 text-sm font-medium text-foreground">{activeDate ? formatDay(activeDate) : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Venta neta</p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">{compactMoney.format(toCordobas(activeValue))}</p>
          </div>
        </div>

        <svg viewBox="0 0 100 88" role="img" aria-label="Barras de venta neta diaria y línea de tendencia" className="h-72 w-full overflow-visible rounded-2xl bg-muted/20">
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = max * ratio;
            const y = yFor(value, max);
            return <g key={ratio}><line x1="10" x2="94" y1={y} y2={y} stroke="currentColor" strokeOpacity=".08" strokeWidth=".4" /><text x="8" y={y + 1} textAnchor="end" fontSize="3" fill="currentColor" opacity=".45">{compactMoney.format(toCordobas(value))}</text></g>;
          })}
          {values.map((value, index) => {
            const x = dates.length > 1 ? 10 + (index * 80) / (dates.length - 1) : 50;
            const barWidth = Math.max(1.6, Math.min(5.2, 58 / Math.max(1, dates.length)));
            const y = yFor(value, max);
            const height = Math.max(1.2, 76 - y);
            const active = index === activeIndex;
            return <g key={dates[index]} onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} tabIndex={0} role="button" aria-label={`${formatDay(dates[index])}: ${compactMoney.format(toCordobas(value))}`} className="cursor-pointer outline-none"><rect x={x - barWidth / 2} y={76 - height} width={barWidth} height={height} rx="1.2" fill="var(--primary)" opacity={active ? ".95" : ".48"} /><circle cx={x} cy={y} r={active ? "2.2" : "1.45"} fill="var(--primary)" /></g>;
          })}
          <polyline points={linePoints} fill="none" stroke="currentColor" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          {activeDate ? <line x1={dates.length > 1 ? 10 + (activeIndex * 80) / (dates.length - 1) : 50} x2={dates.length > 1 ? 10 + (activeIndex * 80) / (dates.length - 1) : 50} y1="12" y2="78" stroke="currentColor" strokeOpacity=".16" strokeDasharray="2 2" /> : null}
          {dates.map((date, index) => index % labelEvery === 0 ? <text key={date} x={dates.length > 1 ? 10 + (index * 80) / (dates.length - 1) : 50} y="84" textAnchor="middle" fontSize="3.2" fill="currentColor" opacity=".52">{date.slice(5)}</text> : null)}
        </svg>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-primary/60" />Venta diaria</span>
          <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Tendencia móvil 3 días</span>
        </div>
        {trend.some((query) => query.error) ? <p className="mt-2 text-xs text-danger">Una parte de la serie no pudo cargarse.</p> : null}
      </div>
    </article>

    <article className="rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><BarChart3 className="h-4 w-4" />{admin ? "Ranking por vendedor" : "Detalle diario"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{admin ? "Comparativo por venta neta en el rango elegido" : "Venta neta por cada día del rango"}</p>
      <div className="mt-5 space-y-4">{admin ? sellers.data?.data.length ? sellers.data.data.map((seller, index) => <div key={seller.sellerId} className="rounded-xl border border-border bg-background/50 p-3"><div className="flex justify-between gap-3 text-xs"><span className="truncate font-medium"><span className="mr-2 text-muted-foreground">#{index + 1}</span>{seller.sellerName}</span><span className="font-mono text-muted-foreground">{compactMoney.format(toCordobas(seller.netSalesMiles))}</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(3, seller.netSalesMiles / sellerMax * 100)}%` }} /></div><p className="mt-2 text-[11px] text-muted-foreground">{seller.salesCount ?? 0} ventas · saldo {compactMoney.format(toCordobas(seller.balanceMiles))}</p></div>) : <p className="py-12 text-center text-sm text-muted-foreground">Sin actividad en el período.</p> : values.map((value, index) => <div key={dates[index]} className="grid grid-cols-[64px_1fr_auto] items-center gap-2 text-xs"><span className="text-muted-foreground">{formatDay(dates[index])}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, value / Math.max(1, ...values) * 100)}%` }} /></div><span className="w-20 text-right font-mono">{compactMoney.format(toCordobas(value))}</span></div>)}</div>
    </article>
  </section>;
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return <div className="rounded-xl border border-border bg-background/50 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 truncate font-mono text-base font-semibold text-foreground">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{helper}</p></div>;
}
