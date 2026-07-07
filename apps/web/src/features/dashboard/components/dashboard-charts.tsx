"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Hash, LineChart, Sparkles, TrendingUp, UsersRound } from "lucide-react";
import { ChartContainer, ChartLegend, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { analyticsOptions } from "@/features/operations/queries/operations.queries";
import type { BusinessAnalyticsDayKpi } from "@/features/operations/types/operations.types";

const compactMoney = new Intl.NumberFormat("es-NI", {
  compactDisplay: "short",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
  currency: "NIO",
});
const money = new Intl.NumberFormat("es-NI", { maximumFractionDigits: 2, style: "currency", currency: "NIO" });
const plain = new Intl.NumberFormat("es-NI", { maximumFractionDigits: 2 });
const dayLabel = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", timeZone: "UTC" });

const trendConfig = {
  netSales: { label: "Venta neta", color: "var(--chart-1)", valueFormatter: (value: number) => compactMoney.format(value) },
  grossSales: { label: "Venta bruta", color: "var(--chart-2)", valueFormatter: (value: number) => compactMoney.format(value) },
} satisfies ChartConfig;

const rankingConfig = {
  value: { label: "Venta neta", color: "var(--chart-1)", valueFormatter: (value: number) => compactMoney.format(value) },
} satisfies ChartConfig;

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

function moneyLabel(miles = 0) {
  return compactMoney.format(toCordobas(miles));
}

function trendRows(trend: BusinessAnalyticsDayKpi[]) {
  return trend.map((day) => ({
    date: day.date,
    label: formatDay(day.date),
    netSales: toCordobas(day.netSalesMiles),
    grossSales: toCordobas(day.grossSalesMiles),
    averageTicket: toCordobas(day.averageTicketMiles),
    salesCount: day.salesCount,
    sellersCount: day.sellersCount,
  }));
}

function axisMoney(value: number) {
  return compactMoney.format(value);
}

function EmptyState({ message }: { message: string }) {
  return <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-border bg-muted/20 text-center text-sm text-muted-foreground">{message}</div>;
}

function Metric({ label, value, helper, tone = "neutral" }: { label: string; value: string; helper: string; tone?: "neutral" | "good" | "warn" }) {
  return <div className="rounded-2xl border border-border bg-background/55 p-4">
    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    <p className={`mt-2 truncate font-mono text-lg font-semibold ${tone === "good" ? "text-emerald-600 dark:text-emerald-300" : tone === "warn" ? "text-amber-700 dark:text-amber-300" : "text-foreground"}`}>{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
  </div>;
}

export function DashboardCharts({ admin, sellerId }: { admin: boolean; sellerId?: string }) {
  const [range, setRange] = useState<Required<DateRangeValue>>(defaultRange);
  const analytics = useQuery({
    ...analyticsOptions({ dateFrom: range.from, dateUntil: range.to, topLimit: 8, ...(!admin && sellerId ? { sellerId } : {}) }),
    enabled: admin || Boolean(sellerId),
  });
  const data = analytics.data;
  const trendData = useMemo(() => trendRows(data?.trend ?? []), [data?.trend]);
  const rankingData = useMemo(() => {
    if (!data) return [];
    if (admin) {
      return data.sellers.slice(0, 6).map((seller, index) => ({
        label: `${index + 1}. ${seller.sellerName}`,
        value: toCordobas(seller.netSalesMiles),
        helper: `${seller.salesCount ?? 0} ventas · ${plain.format(seller.contributionPercent)}%`,
      }));
    }
    return data.bestDays.slice(0, 6).map((day) => ({
      label: formatDay(day.date),
      value: toCordobas(day.netSalesMiles),
      helper: `${day.salesCount} ventas · ticket ${money.format(toCordobas(day.averageTicketMiles))}`,
    }));
  }, [admin, data]);
  const numberRows = useMemo(() => (data?.topNumbers ?? []).slice(0, 6).map((item) => ({
    label: `#${item.number}`,
    value: toCordobas(item.netSalesMiles),
    helper: `${item.ticketsCount} tickets · ${item.sellersCount} vendedores`,
  })), [data?.topNumbers]);
  const loading = analytics.isLoading;
  const summary = data?.summary;
  const projection = data?.projection;

  return <section className="space-y-4" aria-label="Analítica ejecutiva">
    <MotionReveal>
      <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_60px_rgba(0,0,0,0.035)]">
        <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><LineChart className="h-4 w-4" />Venta neta y bruta</p>
            <p className="mt-1 text-xs text-muted-foreground">{admin ? "Operación global" : "Tu operación"} · datos reales del endpoint analytics/KPI</p>
          </div>
          <DateRangePicker className="lg:w-72" from={range.from} to={range.to} allowClear={false} onChange={(next) => next.from && next.to ? setRange({ from: next.from, to: next.to }) : undefined} placeholder="Rango de gráficas" />
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Venta neta" value={moneyLabel(summary?.netSalesMiles)} helper={`${summary?.salesCount ?? 0} tickets · ${summary?.activeSalesCount ?? 0} activos`} />
          <Metric label="Balance" value={moneyLabel(summary?.balanceMiles)} helper={`Premios pagados ${moneyLabel(summary?.paidPrizesMiles)}`} tone={(summary?.balanceMiles ?? 0) >= 0 ? "good" : "warn"} />
          <Metric label="Ticket promedio" value={moneyLabel(summary?.averageTicketMiles)} helper={`${summary?.numbersSoldCount ?? 0} números vendidos`} />
          <Metric label="Proyección 30 días" value={moneyLabel(projection?.projectedNext30DaysNetSalesMiles)} helper={`${moneyLabel(projection?.averageDailyNetSalesMiles)} promedio diario`} />
        </div>

        <div className="px-5 pb-5">
          {loading ? <EmptyState message="Cargando analytics…" /> : trendData.length ? <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 4, right: 12, top: 16, bottom: 0 }} accessibilityLayer>
                <defs>
                  <linearGradient id="netSalesFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="grossSalesFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={18} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={axisMoney} width={72} />
                <Tooltip cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }} content={<ChartTooltipContent config={trendConfig} labelFormatter={(label) => String(label ?? "Día")} />} />
                <Area type="monotone" dataKey="grossSales" stroke="var(--chart-2)" fill="url(#grossSalesFill)" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="netSales" stroke="var(--chart-1)" fill="url(#netSalesFill)" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer> : <EmptyState message={analytics.error ? analytics.error.message : "Sin ventas en el período seleccionado."} />}
          <ChartLegend config={trendConfig} keys={["netSales", "grossSales"]} className="mt-3" />
        </div>
      </article>
    </MotionReveal>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <MotionReveal delay={0.05}>
        <InsightBars title={admin ? "Ranking por vendedor" : "Mejores días"} description={admin ? "Quién aporta más a la venta neta del período." : "Días con mejor rendimiento propio."} icon={admin ? UsersRound : BarChart3} rows={rankingData} empty={admin ? "Sin vendedores con actividad." : "Sin mejores días para mostrar."} />
      </MotionReveal>
      <MotionReveal delay={0.1}>
        <InsightBars title="Números top" description="Números con mayor movimiento y tickets asociados." icon={Hash} rows={numberRows} empty="Sin números vendidos." />
      </MotionReveal>
    </div>

    <MotionReveal delay={0.15}>
      <article className="grid gap-3 rounded-3xl border border-border bg-card p-5 md:grid-cols-3">
        <ExecutiveSignal icon={Sparkles} label="Mejor vendedor" value={summary?.bestSeller?.sellerName ?? "—"} helper={summary?.bestSeller ? moneyLabel(summary.bestSeller.netSalesMiles) : "Sin líder en este rango"} />
        <ExecutiveSignal icon={Hash} label="Mejor número" value={summary?.bestNumber ? `#${summary.bestNumber.number}` : "—"} helper={summary?.bestNumber ? `${moneyLabel(summary.bestNumber.netSalesMiles)} · ${summary.bestNumber.ticketsCount} tickets` : "Sin número destacado"} />
        <ExecutiveSignal icon={TrendingUp} label="Mejor día" value={formatDay(summary?.bestDay?.date)} helper={summary?.bestDay ? `${moneyLabel(summary.bestDay.netSalesMiles)} · ${summary.bestDay.salesCount} ventas` : "Sin día destacado"} />
      </article>
    </MotionReveal>
  </section>;
}

function InsightBars({ title, description, icon: Icon, rows, empty }: { title: string; description: string; icon: typeof BarChart3; rows: Array<{ label: string; value: number; helper: string }>; empty: string }) {
  return <article className="rounded-3xl border border-border bg-card p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Icon className="h-4 w-4" />{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    {rows.length ? <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
      <ChartContainer className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 6, right: 10, top: 4, bottom: 4 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={96} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: "var(--accent)" }} content={<ChartTooltipContent config={rankingConfig} />} />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="space-y-3">
        {rows.slice(0, 4).map((row) => <div key={row.label} className="rounded-2xl border border-border bg-background/55 p-3">
          <div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-medium text-foreground">{row.label}</span><span className="font-mono text-muted-foreground">{compactMoney.format(row.value)}</span></div>
          <p className="mt-1 text-[11px] text-muted-foreground">{row.helper}</p>
        </div>)}
      </div>
    </div> : <p className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">{empty}</p>}
  </article>;
}

function ExecutiveSignal({ icon: Icon, label, value, helper }: { icon: typeof Sparkles; label: string; value: string; helper: string }) {
  return <div className="rounded-2xl border border-border bg-background/55 p-4">
    <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</p>
    <p className="mt-3 truncate text-base font-semibold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
  </div>;
}
