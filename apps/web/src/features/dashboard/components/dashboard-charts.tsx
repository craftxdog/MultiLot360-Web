"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp } from "lucide-react";
import { reportOptions, sellerReportsOptions } from "@/features/operations/queries/operations.queries";

function dateRange(days: number) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const anchor = new Date(`${today}T00:00:00.000Z`);
  return Array.from({ length: days }, (_, index) => new Date(anchor.getTime() - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10));
}

const money = new Intl.NumberFormat("es-NI", { maximumFractionDigits: 2 });

export function DashboardCharts({ admin, sellerId }: { admin: boolean; sellerId?: string }) {
  const dates = useMemo(() => dateRange(7), []);
  const trend = useQueries({ queries: dates.map((date) => ({ ...reportOptions({ dateFrom: date, dateUntil: date, ...(!admin && sellerId ? { sellerId } : {}) }), enabled: admin || Boolean(sellerId), staleTime: 30_000 })) });
  const sellers = useQuery({ ...sellerReportsOptions({ dateFrom: dates[0], dateUntil: dates.at(-1) ?? dates[0], page: 1, limit: 8, sortBy: "netSalesMiles", sortDirection: "desc" }), enabled: admin, staleTime: 30_000 });
  const values = trend.map((query) => query.data?.netSalesMiles ?? 0);
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => `${8 + index * 15.3},${82 - (value / max) * 62}`).join(" ");
  const areaPath = `M 8 82 ${points.split(" ").map((point) => `L ${point.replace(",", " ")}`).join(" ")} L 99.8 82 Z`;

  return <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]" aria-label="Gráficas operativas">
    <article className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between"><div><p className="flex items-center gap-2 text-sm font-medium"><TrendingUp className="h-4 w-4" />Venta neta · 7 días</p><p className="mt-1 text-xs text-muted-foreground">{admin ? "Operación global" : "Sólo tu actividad"}</p></div><span className="font-mono text-sm">{money.format(values.reduce((total, value) => total + value, 0))} mil</span></div>
      <div className="mt-5"><svg viewBox="0 0 100 90" role="img" aria-label="Tendencia de venta neta" className="h-56 w-full overflow-visible"><defs><linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".28"/><stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/></linearGradient></defs><path d={areaPath} fill="url(#sales-area)" opacity=".7"/><polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>{values.map((value, index) => <g key={dates[index]}><circle cx={8 + index * 15.3} cy={82 - (value / max) * 62} r="1.8" fill="var(--primary)"/><text x={8 + index * 15.3} y="89" textAnchor="middle" fontSize="3.2" fill="currentColor" opacity=".55">{dates[index].slice(5)}</text></g>)}</svg></div>
      {trend.some((query) => query.error) ? <p className="mt-2 text-xs text-danger">Una parte de la serie no pudo cargarse.</p> : null}
    </article>
    <article className="rounded-2xl border border-border bg-card p-5"><p className="flex items-center gap-2 text-sm font-medium"><BarChart3 className="h-4 w-4" />{admin ? "Rendimiento por vendedor" : "Balance del período"}</p><p className="mt-1 text-xs text-muted-foreground">{admin ? "Los 8 vendedores con mayor venta neta" : "Venta neta diaria en miles"}</p>
      <div className="mt-5 space-y-3">{admin ? sellers.data?.data.length ? sellers.data.data.map((seller) => { const sellerMax = Math.max(1, ...sellers.data.data.map((item) => item.netSalesMiles)); return <div key={seller.sellerId}><div className="flex justify-between gap-3 text-xs"><span className="truncate">{seller.sellerName}</span><span className="font-mono text-muted-foreground">{money.format(seller.netSalesMiles)}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, seller.netSalesMiles / sellerMax * 100)}%` }} /></div></div>; }) : <p className="py-12 text-center text-sm text-muted-foreground">Sin actividad en el período.</p> : values.map((value, index) => <div key={dates[index]} className="grid grid-cols-[52px_1fr_auto] items-center gap-2 text-xs"><span className="text-muted-foreground">{dates[index].slice(5)}</span><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, value / max * 100)}%` }} /></div><span className="w-16 text-right font-mono">{money.format(value)}</span></div>)}</div>
    </article>
  </section>;
}
