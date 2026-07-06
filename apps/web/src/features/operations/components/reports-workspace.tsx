"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { SellerEntityCombobox } from "@/features/shared/components/api-entity-comboboxes";
import { reportOptions, sellerReportsOptions } from "../queries/operations.queries";
import { defaultReportDates, reportsQuerySchema } from "../utils/operations-query";
import { useUrlQuery } from "../hooks/use-url-query";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

const money = (value: number | undefined) => `C$ ${((value ?? 0) * 1000).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;

export function ReportsWorkspace() {
  const defaults = defaultReportDates();
  const { query, update, pathname } = useUrlQuery(reportsQuerySchema, defaults);
  const overview = useQuery(reportOptions(query));
  const sellers = useQuery(sellerReportsOptions(query));

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
      <Input name="dateFrom" type="date" defaultValue={query.dateFrom} aria-label="Fecha inicial" />
      <Input name="dateUntil" type="date" defaultValue={query.dateUntil} aria-label="Fecha final" />
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
