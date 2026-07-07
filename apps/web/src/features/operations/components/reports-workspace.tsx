"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DataPagination } from "@/components/ui/data-pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { SellerEntityCombobox } from "@/features/shared/components/api-entity-comboboxes";
import { analyticsOptions, reportOptions, sellerReportsOptions } from "../queries/operations.queries";
import type { BusinessAnalyticsDayKpi, ReportQuery } from "../types/operations.types";
import { defaultReportDates, reportsQuerySchema } from "../utils/operations-query";
import { useUrlQuery } from "../hooks/use-url-query";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

const moneyFormat = new Intl.NumberFormat("es-NI", { currency: "NIO", maximumFractionDigits: 2, style: "currency" });
const compactMoney = new Intl.NumberFormat("es-NI", { compactDisplay: "short", currency: "NIO", maximumFractionDigits: 1, notation: "compact", style: "currency" });
const shortDate = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", timeZone: "UTC" });
const plain = new Intl.NumberFormat("es-NI", { maximumFractionDigits: 1 });

const money = (value: number | undefined) => moneyFormat.format((value ?? 0) * 1000);
const compact = (value: number | undefined) => compactMoney.format((value ?? 0) * 1000);

const trendConfig = {
  netSales: { label: "Venta neta", color: "var(--chart-1)", valueFormatter: (value: number) => compactMoney.format(value) },
  paidPrizes: { label: "Premios pagados", color: "var(--chart-3)", valueFormatter: (value: number) => compactMoney.format(value) },
} satisfies ChartConfig;

const barConfig = {
  value: { label: "Venta neta", color: "var(--chart-1)", valueFormatter: (value: number) => compactMoney.format(value) },
} satisfies ChartConfig;

function toDateLabel(value: string) {
  return shortDate.format(new Date(`${value}T00:00:00.000Z`));
}

function trendRows(days: BusinessAnalyticsDayKpi[]) {
  return days.map((day) => ({
    label: toDateLabel(day.date),
    netSales: day.netSalesMiles * 1000,
    paidPrizes: 0,
    salesCount: day.salesCount,
    sellersCount: day.sellersCount,
  }));
}

export function ReportsWorkspace() {
  const defaults = defaultReportDates();
  const { query, update, pathname } = useUrlQuery(reportsQuerySchema, defaults);
  const reportQuery: ReportQuery = {
    dateFrom: query.dateFrom,
    dateUntil: query.dateUntil,
    ...(query.sellerId ? { sellerId: query.sellerId } : {}),
    ...(query.drawCode ? { drawCode: query.drawCode } : {}),
  };
  const overview = useQuery(reportOptions(reportQuery));
  const analytics = useQuery(analyticsOptions({ ...reportQuery, topLimit: 8 }));
  const sellers = useQuery(sellerReportsOptions(query));
  const trendData = useMemo(() => trendRows(analytics.data?.trend ?? []), [analytics.data?.trend]);
  const topNumbers = useMemo(() => (analytics.data?.topNumbers ?? []).slice(0, 8).map((item) => ({
    label: `#${item.number}`,
    value: item.netSalesMiles * 1000,
    helper: `${item.ticketsCount} tickets · ${item.sellersCount} vendedores`,
  })), [analytics.data?.topNumbers]);
  const topSellers = useMemo(() => (analytics.data?.sellers ?? []).slice(0, 6).map((seller, index) => ({
    label: `${index + 1}. ${seller.sellerName}`,
    value: seller.netSalesMiles * 1000,
    helper: `${seller.salesCount ?? 0} ventas · ${plain.format(seller.contributionPercent)}% aporte`,
  })), [analytics.data?.sellers]);

  const filters = (
    <form
      className="grid gap-2 md:grid-cols-3 xl:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        update({
          dateFrom: String(form.get("dateFrom")),
          dateUntil: String(form.get("dateUntil")),
          sellerId: String(form.get("sellerId") || "") || undefined,
          drawCode: String(form.get("drawCode") || "") || undefined,
          sortBy: String(form.get("sortBy")) as typeof query.sortBy,
        });
      }}
    >
      <DateRangePicker fromName="dateFrom" toName="dateUntil" from={query.dateFrom} to={query.dateUntil} placeholder="Rango del reporte" allowClear={false} required />
      <SellerEntityCombobox name="sellerId" value={query.sellerId} placeholder="Vendedor" />
      <Input name="drawCode" placeholder="Código de sorteo" defaultValue={query.drawCode} aria-label="Código de sorteo" />
      <select name="sortBy" defaultValue={query.sortBy} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">
        <option value="sellerName">Vendedor</option>
        <option value="netSalesMiles">Venta neta</option>
        <option value="paidPrizesMiles">Premios</option>
        <option value="balanceMiles">Saldo</option>
      </select>
      <Button type="submit" variant="secondary">Analizar</Button>
    </form>
  );

  return (
    <OperationsShell eyebrow="Inteligencia operacional" title="Reportes" description="Compara venta neta, premios y saldo con filtros servidos directamente por la API." filters={filters}>
      {overview.error ? <ErrorState message={overview.error.message} /> : (
        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Venta neta" value={money(overview.data?.netSalesMiles)} />
          <Metric label="Premios pagados" value={money(overview.data?.paidPrizesMiles)} />
          <Metric label="Premios pendientes" value={money(overview.data?.pendingPrizesMiles)} />
          <Metric label="Saldo" value={money(overview.data?.balanceMiles)} />
        </section>
      )}
      {analytics.error ? <ErrorState message={analytics.error.message} /> : (
        <section className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
          <article className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-foreground">Tendencia del período</h2>
                <p className="mt-1 text-xs text-muted-foreground">Lectura diaria desde reports/analytics; valores en córdobas.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-64">
                <MiniMetric label="Proy. 7 días" value={compact(analytics.data?.projection.projectedNext7DaysNetSalesMiles)} />
                <MiniMetric label="Proy. 30 días" value={compact(analytics.data?.projection.projectedNext30DaysNetSalesMiles)} />
              </div>
            </div>
            {analytics.isLoading ? <LoadingRows /> : trendData.length ? (
              <div className="pt-4">
                <ChartContainer className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ left: 4, right: 12, top: 12, bottom: 0 }} accessibilityLayer>
                      <defs>
                        <linearGradient id="reportsNetSalesFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={18} />
                      <YAxis axisLine={false} tickFormatter={(value) => compactMoney.format(Number(value))} tickLine={false} width={72} />
                      <Tooltip cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }} content={<ChartTooltipContent config={trendConfig} />} />
                      <Area type="monotone" dataKey="netSales" fill="url(#reportsNetSalesFill)" stroke="var(--chart-1)" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <ChartLegend config={trendConfig} keys={["netSales"]} className="mt-3" />
              </div>
            ) : <EmptyState>No hay tendencia para graficar en este período.</EmptyState>}
          </article>
          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium text-foreground">Señales ejecutivas</h2>
            <p className="mt-1 text-xs text-muted-foreground">Top números, mejor vendedor y ticket promedio.</p>
            <div className="mt-4 grid gap-2">
              <MiniMetric label="Ticket promedio" value={compact(analytics.data?.summary.averageTicketMiles)} />
              <MiniMetric label="Vendedores activos" value={`${analytics.data?.summary.activeSellersCount ?? 0}`} />
              <MiniMetric label="Número líder" value={analytics.data?.summary.bestNumber ? `#${analytics.data.summary.bestNumber.number} · ${compact(analytics.data.summary.bestNumber.netSalesMiles)}` : "—"} />
              <MiniMetric label="Mejor día" value={analytics.data?.summary.bestDay ? `${toDateLabel(analytics.data.summary.bestDay.date)} · ${compact(analytics.data.summary.bestDay.netSalesMiles)}` : "—"} />
            </div>
          </article>
        </section>
      )}
      <section className="mb-5 grid gap-4 xl:grid-cols-2">
        <InsightBars title="Ranking por vendedor" rows={topSellers} empty="Sin vendedores con actividad para comparar." />
        <InsightBars title="Números con más venta" rows={topNumbers} empty="Sin números vendidos para este rango." />
      </section>
      {sellers.isLoading ? <LoadingRows /> : sellers.error ? <ErrorState message={sellers.error.message} /> : !sellers.data?.data.length ? <EmptyState>No hay actividad en este período.</EmptyState> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-muted-foreground"><tr><th className="p-3">Vendedor</th><th>Ventas</th><th>Neta</th><th>Premios</th><th>Saldo</th></tr></thead>
            <tbody>{sellers.data.data.map((row) => <tr key={row.sellerId} className="border-t border-border"><td className="p-3 font-medium">{row.sellerName}</td><td>{row.salesCount}</td><td className="font-mono">{money(row.netSalesMiles)}</td><td className="font-mono">{money(row.paidPrizesMiles)}</td><td className="font-mono">{money(row.balanceMiles)}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {sellers.data ? <DataPagination basePath={pathname} params={query} pagination={sellers.data.pagination} itemLabel="vendedores" /> : null}
    </OperationsShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-serif text-xl">{value}</p></article>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background/60 p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 truncate font-mono text-sm font-semibold text-foreground">{value}</p></div>;
}

function InsightBars({ title, rows, empty }: { title: string; rows: Array<{ label: string; value: number; helper: string }>; empty: string }) {
  return <article className="rounded-2xl border border-border bg-card p-4">
    <h2 className="text-sm font-medium text-foreground">{title}</h2>
    {rows.length ? <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
      <ChartContainer className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 6, right: 10, top: 4, bottom: 4 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={96} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: "var(--accent)" }} content={<ChartTooltipContent config={barConfig} />} />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="space-y-2">
        {rows.slice(0, 4).map((row) => <div key={row.label} className="rounded-xl border border-border bg-background/60 p-3">
          <div className="flex items-center justify-between gap-2 text-xs"><span className="truncate font-medium text-foreground">{row.label}</span><span className="font-mono text-muted-foreground">{compactMoney.format(row.value)}</span></div>
          <p className="mt-1 text-[11px] text-muted-foreground">{row.helper}</p>
        </div>)}
      </div>
    </div> : <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">{empty}</p>}
  </article>;
}
