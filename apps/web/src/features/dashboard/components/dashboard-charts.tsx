"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { BarChart3, LineChart } from "lucide-react";
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker";
import { reportOptions, sellerReportsOptions } from "@/features/operations/queries/operations.queries";

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

function chartPoints(values: number[]) {
  const max = Math.max(1, ...values);
  const width = 100;
  const step = values.length > 1 ? 84 / (values.length - 1) : 0;
  return values.map((value, index) => ({
    x: values.length > 1 ? 8 + index * step : width / 2,
    y: 82 - (value / max) * 62,
    value,
  }));
}

function formatDay(value: string) {
  return dayLabel.format(new Date(`${value}T00:00:00.000Z`));
}

export function DashboardCharts({ admin, sellerId }: { admin: boolean; sellerId?: string }) {
  const [range, setRange] = useState<Required<DateRangeValue>>(defaultRange);
  const [hovered, setHovered] = useState<number | null>(null);
  const dates = useMemo(() => datesBetween(range.from, range.to), [range.from, range.to]);
  const trend = useQueries({ queries: dates.map((date) => ({ ...reportOptions({ dateFrom: date, dateUntil: date, ...(!admin && sellerId ? { sellerId } : {}) }), enabled: admin || Boolean(sellerId), staleTime: 30_000 })) });
  const sellers = useQuery({ ...sellerReportsOptions({ dateFrom: range.from, dateUntil: range.to, page: 1, limit: 8, sortBy: "netSalesMiles", sortDirection: "desc" }), enabled: admin, staleTime: 30_000 });
  const values = trend.map((query) => query.data?.netSalesMiles ?? 0);
  const points = chartPoints(values);
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length ? `M ${points[0].x} 82 ${points.map((point) => `L ${point.x} ${point.y}`).join(" ")} L ${points.at(-1)?.x ?? 92} 82 Z` : "";
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length ? total / values.length : 0;
  const best = values.reduce((winner, value, index) => value > winner.value ? { value, index } : winner, { value: 0, index: 0 });
  const activePoint = hovered === null ? (points.length ? points.length - 1 : null) : hovered;
  const sellerMax = Math.max(1, ...(sellers.data?.data.map((seller) => seller.netSalesMiles) ?? [1]));

  return <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]" aria-label="Gráficas operativas">
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="flex items-center gap-2 text-sm font-medium"><LineChart className="h-4 w-4" />Venta neta dinámica</p><p className="mt-1 text-xs text-muted-foreground">{admin ? "Operación global" : "Sólo tu actividad"} · máximo 31 puntos diarios</p></div>
        <DateRangePicker className="lg:w-72" from={range.from} to={range.to} allowClear={false} onChange={(next) => next.from && next.to ? setRange({ from: next.from, to: next.to }) : undefined} placeholder="Rango de gráficas" />
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <Metric label="Total" value={`${money.format(total)} mil`} />
        <Metric label="Promedio diario" value={`${money.format(average)} mil`} />
        <Metric label="Mejor día" value={dates[best.index] ? `${formatDay(dates[best.index])} · ${money.format(best.value)}` : "—"} />
      </div>
      <div className="px-5 pb-5">
        <svg viewBox="0 0 100 90" role="img" aria-label="Tendencia de venta neta por día" className="h-72 w-full overflow-visible rounded-2xl bg-muted/20">
          <defs><linearGradient id="dashboard-sales-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".34" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
          {[20, 40, 60, 80].map((line) => <line key={line} x1="6" x2="96" y1={line} y2={line} stroke="currentColor" strokeOpacity=".08" strokeWidth=".4" />)}
          <path d={area} fill="url(#dashboard-sales-area)" />
          <polyline points={polyline} fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => <g key={dates[index]} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} className="cursor-pointer"><circle cx={point.x} cy={point.y} r={activePoint === index ? "2.8" : "2"} fill="var(--primary)" /><circle cx={point.x} cy={point.y} r="6" fill="transparent" /></g>)}
          {activePoint !== null && points[activePoint] ? <g><line x1={points[activePoint].x} x2={points[activePoint].x} y1="12" y2="82" stroke="currentColor" strokeOpacity=".16" strokeDasharray="2 2" /><foreignObject x={Math.min(68, Math.max(4, points[activePoint].x - 15))} y="8" width="30" height="17"><div className="rounded-lg border border-border bg-background px-2 py-1 text-center text-[4px] shadow-xl"><p>{formatDay(dates[activePoint])}</p><p className="font-mono">{money.format(points[activePoint].value)} mil</p></div></foreignObject></g> : null}
          {dates.map((date, index) => index % Math.ceil(dates.length / 6) === 0 ? <text key={date} x={points[index]?.x ?? 8} y="88" textAnchor="middle" fontSize="3.2" fill="currentColor" opacity=".52">{date.slice(5)}</text> : null)}
        </svg>
        {trend.some((query) => query.error) ? <p className="mt-2 text-xs text-danger">Una parte de la serie no pudo cargarse.</p> : null}
      </div>
    </article>

    <article className="rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium"><BarChart3 className="h-4 w-4" />{admin ? "Ranking por vendedor" : "Balance del rango"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{admin ? "Comparativo por venta neta en el rango elegido" : "Venta neta diaria en miles"}</p>
      <div className="mt-5 space-y-4">{admin ? sellers.data?.data.length ? sellers.data.data.map((seller, index) => <div key={seller.sellerId} className="rounded-xl border border-border bg-background/50 p-3"><div className="flex justify-between gap-3 text-xs"><span className="truncate"><span className="mr-2 text-muted-foreground">#{index + 1}</span>{seller.sellerName}</span><span className="font-mono text-muted-foreground">{money.format(seller.netSalesMiles)} mil</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(3, seller.netSalesMiles / sellerMax * 100)}%` }} /></div><p className="mt-2 text-[11px] text-muted-foreground">{seller.salesCount ?? 0} ventas · saldo {money.format(seller.balanceMiles)} mil</p></div>) : <p className="py-12 text-center text-sm text-muted-foreground">Sin actividad en el período.</p> : values.map((value, index) => <div key={dates[index]} className="grid grid-cols-[58px_1fr_auto] items-center gap-2 text-xs"><span className="text-muted-foreground">{formatDay(dates[index])}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, value / Math.max(1, ...values) * 100)}%` }} /></div><span className="w-16 text-right font-mono">{money.format(value)}</span></div>)}</div>
    </article>
  </section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background/50 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 truncate font-mono text-sm">{value}</p></div>;
}
