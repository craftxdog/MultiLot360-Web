"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Hash, LineChart, TrendingUp, UsersRound } from "lucide-react";
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker";
import { analyticsOptions } from "@/features/operations/queries/operations.queries";
import type { BusinessAnalyticsDayKpi } from "@/features/operations/types/operations.types";

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
  return { from: addDays(to, -29), to };
}

function formatDay(value?: string) {
  if (!value) return "—";
  return dayLabel.format(new Date(`${value}T00:00:00.000Z`));
}

function toCordobas(miles = 0) {
  return miles * 1000;
}

function chartPoints(trend: BusinessAnalyticsDayKpi[]) {
  const max = Math.max(1, ...trend.map((day) => day.netSalesMiles));
  return trend.map((day, index) => {
    const x = trend.length > 1 ? 10 + (index * 82) / (trend.length - 1) : 51;
    const y = 78 - (day.netSalesMiles / max) * 58;
    return { ...day, x, y, max };
  });
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return <div className="rounded-2xl border border-border bg-background/55 p-4">
    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    <p className="mt-2 truncate font-mono text-lg font-semibold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
  </div>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-border bg-muted/20 text-center text-sm text-muted-foreground">{message}</div>;
}

export function DashboardCharts({ admin, sellerId }: { admin: boolean; sellerId?: string }) {
  const [range, setRange] = useState<Required<DateRangeValue>>(defaultRange);
  const [hovered, setHovered] = useState<number | null>(null);
  const analytics = useQuery({
    ...analyticsOptions({ dateFrom: range.from, dateUntil: range.to, topLimit: 8, ...(!admin && sellerId ? { sellerId } : {}) }),
    enabled: admin || Boolean(sellerId),
  });
  const data = analytics.data;
  const trend = useMemo(() => data?.trend ?? [], [data?.trend]);
  const points = useMemo(() => chartPoints(trend), [trend]);
  const max = points[0]?.max ?? 1;
  const activeIndex = hovered ?? Math.max(0, points.length - 1);
  const active = points[activeIndex];
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length ? `10,78 ${line} 92,78` : "";
  const sellerMax = Math.max(1, ...(data?.sellers.map((seller) => seller.netSalesMiles) ?? [1]));
  const numberMax = Math.max(1, ...(data?.topNumbers.map((number) => number.netSalesMiles) ?? [1]));

  return <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]" aria-label="Analítica ejecutiva">
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_60px_rgba(0,0,0,0.035)]">
      <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><LineChart className="h-4 w-4" />Venta neta dinámica</p>
          <p className="mt-1 text-xs text-muted-foreground">{admin ? "Operación global" : "Tu operación"} · analytics/KPI oficial de la API</p>
        </div>
        <DateRangePicker className="lg:w-72" from={range.from} to={range.to} allowClear={false} onChange={(next) => next.from && next.to ? setRange({ from: next.from, to: next.to }) : undefined} placeholder="Rango de gráficas" />
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-4">
        <Metric label="Venta neta" value={compactMoney.format(toCordobas(data?.summary.netSalesMiles ?? 0))} helper={`${money.format(data?.summary.salesCount ?? 0)} tickets`} />
        <Metric label="Ticket promedio" value={compactMoney.format(toCordobas(data?.summary.averageTicketMiles ?? 0))} helper="Promedio del rango" />
        <Metric label="Números vendidos" value={String(data?.summary.numbersSoldCount ?? 0)} helper={`${data?.summary.activeSellersCount ?? 0} vendedores activos`} />
        <Metric label="Proyección 7 días" value={compactMoney.format(toCordobas(data?.projection.projectedNext7DaysNetSalesMiles ?? 0))} helper={`${money.format(data?.projection.averageDailyNetSalesMiles ?? 0)} mil/día`} />
      </div>

      <div className="px-5 pb-5">
        {analytics.isLoading ? <EmptyChart message="Cargando analytics…" /> : points.length ? <div>
          <div className="mb-3 grid gap-3 rounded-2xl border border-border bg-background/60 p-3 sm:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Día seleccionado</p><p className="mt-1 text-sm font-medium text-foreground">{formatDay(active?.date)}</p></div>
            <div><p className="text-xs text-muted-foreground">Venta neta</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">{compactMoney.format(toCordobas(active?.netSalesMiles ?? 0))}</p></div>
            <div><p className="text-xs text-muted-foreground">Ventas / vendedores</p><p className="mt-1 text-sm font-medium text-foreground">{active?.salesCount ?? 0} / {active?.sellersCount ?? 0}</p></div>
          </div>
          <svg viewBox="0 0 100 92" role="img" aria-label="Tendencia de venta neta" className="h-72 w-full overflow-visible rounded-2xl bg-muted/20">
            <defs>
              <linearGradient id="dashboardAnalyticsFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity=".28" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = max * ratio;
              const y = 78 - ratio * 58;
              return <g key={ratio}><line x1="10" x2="94" y1={y} y2={y} stroke="currentColor" strokeOpacity=".08" strokeWidth=".4" /><text x="8" y={y + 1} textAnchor="end" fontSize="3" fill="currentColor" opacity=".45">{compactMoney.format(toCordobas(value))}</text></g>;
            })}
            <path d={`M ${area} Z`} fill="url(#dashboardAnalyticsFill)" />
            <polyline points={line} fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => {
              const barWidth = Math.max(1.5, Math.min(5.4, 58 / Math.max(1, points.length)));
              const height = Math.max(1.2, 78 - point.y);
              const selected = index === activeIndex;
              return <g key={point.date} tabIndex={0} role="button" aria-label={`${formatDay(point.date)} ${compactMoney.format(toCordobas(point.netSalesMiles))}`} onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} className="cursor-pointer outline-none">
                <rect x={point.x - barWidth / 2} y={78 - height} width={barWidth} height={height} rx="1.2" fill="var(--primary)" opacity={selected ? ".62" : ".22"} />
                <circle cx={point.x} cy={point.y} r={selected ? "2.4" : "1.5"} fill="var(--primary)" />
              </g>;
            })}
            {active ? <line x1={active.x} x2={active.x} y1="14" y2="80" stroke="currentColor" strokeOpacity=".14" strokeDasharray="2 2" /> : null}
            {points.map((point, index) => index % Math.max(1, Math.ceil(points.length / 6)) === 0 ? <text key={point.date} x={point.x} y="88" textAnchor="middle" fontSize="3.2" fill="currentColor" opacity=".52">{point.date.slice(5)}</text> : null)}
          </svg>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-primary/30" />Volumen diario</span>
            <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Tendencia neta</span>
          </div>
        </div> : <EmptyChart message={analytics.error ? analytics.error.message : "Sin ventas en el período seleccionado."} />}
      </div>
    </article>

    <div className="space-y-4">
      <article className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><BarChart3 className="h-4 w-4" />{admin ? "Ranking por vendedor" : "Mejores días"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{admin ? "Contribución real al neto del rango" : "Tus días con mejor desempeño"}</p>
        <div className="mt-5 space-y-3">
          {admin ? data?.sellers.length ? data.sellers.map((seller, index) => <div key={seller.sellerId} className="rounded-2xl border border-border bg-background/55 p-3">
            <div className="flex justify-between gap-3 text-xs"><span className="truncate font-medium"><span className="mr-2 text-muted-foreground">#{index + 1}</span>{seller.sellerName}</span><span className="font-mono text-muted-foreground">{compactMoney.format(toCordobas(seller.netSalesMiles))}</span></div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, seller.netSalesMiles / sellerMax * 100)}%` }} /></div>
            <p className="mt-2 text-[11px] text-muted-foreground">{seller.salesCount ?? 0} ventas · {money.format(seller.contributionPercent)}% del neto</p>
          </div>) : <p className="py-8 text-center text-sm text-muted-foreground">Sin vendedores con actividad.</p> : data?.bestDays.length ? data.bestDays.map((day) => <CompactBar key={day.date} label={formatDay(day.date)} value={day.netSalesMiles} max={max} helper={`${day.salesCount} ventas`} />) : <p className="py-8 text-center text-sm text-muted-foreground">Sin actividad en el rango.</p>}
        </div>
      </article>

      <article className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Hash className="h-4 w-4" />Números top</p>
        <p className="mt-1 text-xs text-muted-foreground">Qué números están moviendo más dinero.</p>
        <div className="mt-5 space-y-3">
          {data?.topNumbers.length ? data.topNumbers.map((number) => <CompactBar key={number.number} label={`#${number.number}`} value={number.netSalesMiles} max={numberMax} helper={`${number.ticketsCount} tickets · ${number.sellersCount} vendedores`} />) : <p className="py-8 text-center text-sm text-muted-foreground">Sin números vendidos.</p>}
        </div>
      </article>

      {data?.summary.bestSeller ? <article className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><UsersRound className="h-4 w-4" />Líder del período</p>
        <p className="mt-3 text-lg font-semibold text-foreground">{data.summary.bestSeller.sellerName}</p>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{compactMoney.format(toCordobas(data.summary.bestSeller.netSalesMiles))}</p>
      </article> : null}
    </div>
  </section>;
}

function CompactBar({ label, value, max, helper }: { label: string; value: number; max: number; helper: string }) {
  return <div className="grid grid-cols-[52px_1fr_auto] items-center gap-3 text-xs">
    <span className="font-medium text-foreground">{label}</span>
    <div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, value / Math.max(1, max) * 100)}%` }} /></div>
      <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>
    </div>
    <span className="font-mono text-muted-foreground">{compactMoney.format(toCordobas(value))}</span>
  </div>;
}
