"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, RefreshCcw, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SellerEntityCombobox, ShiftEntityCombobox } from "@/features/shared/components/api-entity-comboboxes";
import { salesMatrixQueryOptions } from "../queries/sales-matrix.queries";
import type { SalesMatrixQuery, SalesMatrixStatus } from "../types/sales-matrix.types";
import { buildSalesMatrixQueryString, parseSalesMatrixQuery } from "../utils/sales-matrix-query";

const money = new Intl.NumberFormat("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateTimeParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Managua",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function formatGeneratedAt(value: string) {
  const parts = Object.fromEntries(
    dateTimeParts.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year}, ${parts.hour}:${parts.minute}:${parts.second}`;
}

function Summary({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <article className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-serif text-2xl text-foreground">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{hint}</p></article>;
}

export function SalesMatrixWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseSalesMatrixQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const matrix = useQuery(salesMatrixQueryOptions(query));
  const update = (changes: Partial<SalesMatrixQuery>) => {
    router.replace(`${pathname}${buildSalesMatrixQueryString({ ...query, ...changes })}`, { scroll: false });
  };
  const data = matrix.data;
  const maxAmount = Math.max(1, ...(data?.rows.flatMap((row) => row.cells.map((cell) => cell.amountMiles)) ?? [1]));

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><Zap className="h-3.5 w-3.5" />Lectura operacional en vivo</div><h1 className="text-2xl font-medium tracking-[-0.04em]">Matriz de ventas</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Las 100 posiciones, comparables de un vistazo y actualizadas por eventos confirmados de la API.</p></div><Button variant="secondary" className="h-9 gap-2" onClick={() => matrix.refetch()} disabled={matrix.isFetching}><RefreshCcw className={`h-4 w-4 ${matrix.isFetching ? "animate-spin" : ""}`} />Actualizar</Button></header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de matriz"><Summary label="Total vendido" value={`C$ ${money.format((data?.summary.totalMiles ?? 0) * 1000)}`} hint="monto contable" /><Summary label="Ventas" value={String(data?.summary.salesCount ?? 0)} hint="tickets distintos" /><Summary label="Jugadas" value={String(data?.summary.itemsCount ?? 0)} hint="ítems vendidos" /><Summary label="Cobertura" value={`${data?.summary.soldNumbersCount ?? 0}/100`} hint="números con movimiento" /></section>

    <section className="rounded-2xl border border-border bg-card p-4"><form className="grid gap-2 lg:grid-cols-[160px_170px_minmax(150px,1fr)_minmax(190px,1fr)_minmax(190px,1fr)_auto]" onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); update({ date: String(values.get("date")), status: String(values.get("status")) as SalesMatrixStatus, drawCode: String(values.get("drawCode") || "").trim().toLowerCase() || undefined, shiftId: String(values.get("shiftId") || "").trim() || undefined, sellerId: String(values.get("sellerId") || "").trim() || undefined }); }}><Input name="date" type="date" defaultValue={query.date} aria-label="Fecha de la matriz" /><select name="status" defaultValue={query.status} aria-label="Estado de ventas" className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="ACTIVA">Activas</option><option value="ANULADA">Anuladas</option><option value="TODAS">Todas</option></select><Input name="drawCode" defaultValue={query.drawCode} placeholder="Código de sorteo" aria-label="Código de sorteo" /><ShiftEntityCombobox name="shiftId" value={query.shiftId} placeholder="Turno" /><SellerEntityCombobox name="sellerId" value={query.sellerId} placeholder="Vendedor" /><Button type="submit" variant="secondary" className="h-11 gap-2"><Search className="h-4 w-4" />Filtrar</Button></form>

      {matrix.error ? <div role="alert" className="mt-4 rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">{matrix.error.message}</div> : null}
      <div className={`mt-5 overflow-x-auto transition-opacity ${matrix.isFetching ? "opacity-60" : ""}`}><div className="grid min-w-[820px] grid-cols-10 gap-2" aria-label="Cuadrícula de números 00 a 99">{data?.rows.flatMap((row) => row.cells).map((cell) => { const intensity = cell.amountMiles / maxAmount; return <article key={cell.number} className="relative min-h-24 overflow-hidden rounded-xl border border-border p-3" style={{ backgroundColor: cell.sold ? `color-mix(in oklab, var(--primary) ${Math.max(8, intensity * 30)}%, var(--card))` : undefined }}><div className="flex items-start justify-between"><span className="font-mono text-lg font-medium">{cell.number}</span>{cell.sold ? <Activity className="h-3.5 w-3.5 text-primary" /> : null}</div><p className="mt-3 truncate font-mono text-xs">{money.format(cell.amountMiles)} mil</p><p className="mt-1 text-[10px] text-muted-foreground">{cell.salesCount} ventas · {cell.itemsCount} jugadas</p></article>; })}</div></div>
      <p className="mt-4 text-right text-[11px] text-muted-foreground">Generada {data?.generatedAt ? formatGeneratedAt(data.generatedAt) : "—"}</p>
    </section>
  </div>;
}
