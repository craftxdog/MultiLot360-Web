"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUrlQuery } from "../hooks/use-url-query";
import { cutOptions, cutSummaryOptions, cutsOptions, operationKeys } from "../queries/operations.queries";
import { operationsService } from "../services/operations.service";
import { cutsQuerySchema } from "../utils/operations-query";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";
import { OperationDetailDrawer } from "./operation-detail-drawer";

const money = new Intl.NumberFormat("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CutsWorkspace() {
  const { query, update, pathname } = useUrlQuery(cutsQuerySchema);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = useQuery(cutsOptions(query));
  const detail = useQuery(cutOptions(selectedId ?? ""));
  const summary = useQuery(cutSummaryOptions(selectedId ?? ""));
  const user = useCurrentUser();
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: operationsService.createCut,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: operationKeys.cuts });
      toast.success("Corte creado");
    },
    onError: (error) => toast.error(error.message),
  });

  const filters = (
    <form
      className="grid gap-2 md:grid-cols-3 xl:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const visible = String(form.get("visibleToSellers") ?? "");
        update({
          startDate: String(form.get("startDate") ?? "") || undefined,
          endDate: String(form.get("endDate") ?? "") || undefined,
          visibleToSellers: visible ? visible === "true" : undefined,
          createdByUserId: String(form.get("createdByUserId") ?? "") || undefined,
          sortBy: String(form.get("sortBy")) as typeof query.sortBy,
        });
      }}
    >
      <Input name="startDate" type="date" defaultValue={query.startDate} />
      <Input name="endDate" type="date" defaultValue={query.endDate} />
      <select name="visibleToSellers" defaultValue={query.visibleToSellers === undefined ? "" : String(query.visibleToSellers)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="">Toda visibilidad</option><option value="true">Visible</option><option value="false">Interno</option></select>
      <Input name="createdByUserId" placeholder="ID creador" defaultValue={query.createdByUserId} />
      <select name="sortBy" defaultValue={query.sortBy} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="createdAt">Creación</option><option value="startDate">Inicio</option><option value="endDate">Final</option></select>
      <Button type="submit" variant="secondary">Aplicar</Button>
    </form>
  );

  const actions = user.data?.permissions.includes("cortes.create") ? (
    <details className="relative"><summary className="cursor-pointer list-none"><span className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Nuevo corte</span></summary><form className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xl" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); create.mutate({ startDate: String(form.get("startDate")), endDate: String(form.get("endDate")), description: String(form.get("description") ?? "") || undefined, visibleToSellers: form.get("visibleToSellers") === "on" }); }}><Input name="startDate" type="date" required /><Input name="endDate" type="date" required /><Input name="description" placeholder="Descripción opcional" /><label className="flex items-center gap-2 text-xs"><input name="visibleToSellers" type="checkbox" defaultChecked />Visible para vendedores</label><Button type="submit" className="w-full">Crear corte</Button></form></details>
  ) : null;

  return <>
    <OperationsShell eyebrow="Conciliación" title="Cortes de caja" description="Consolida ventas, anulaciones, premios y saldo por período sin perder trazabilidad." actions={actions} filters={filters}>
      {list.isLoading ? <LoadingRows /> : list.error ? <ErrorState message={list.error.message} /> : !list.data?.data.length ? <EmptyState>No hay cortes con estos filtros.</EmptyState> : <div className="space-y-2">{list.data.data.map((cut) => <button type="button" onClick={() => setSelectedId(cut.id)} key={cut.id} className="grid w-full gap-3 rounded-xl border border-border p-4 text-left transition hover:bg-accent md:grid-cols-[1fr_auto_auto_24px] md:items-center"><span><span className="block text-sm font-medium">{cut.startDate} — {cut.endDate}</span><span className="mt-1 block text-xs text-muted-foreground">{cut.description ?? "Sin descripción"}</span></span><span className="rounded-full border border-border px-3 py-1 text-xs">{cut.visibleToSellers ? "Visible" : "Interno"}</span><span className="text-xs text-muted-foreground">{cut.createdBy?.name ?? cut.createdBy?.username ?? "Sistema"}</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>)}</div>}
      {list.data ? <DataPagination basePath={pathname} params={query} pagination={list.data.pagination} itemLabel="cortes" /> : null}
    </OperationsShell>
    <OperationDetailDrawer open={Boolean(selectedId)} eyebrow="Resumen contable" title={detail.data ? `${detail.data.startDate} — ${detail.data.endDate}` : "Cargando corte…"} onClose={() => setSelectedId(null)}>
      {detail.error ? <ErrorState message={detail.error.message} /> : summary.error ? <ErrorState message={summary.error.message} /> : detail.isLoading || summary.isLoading ? <LoadingRows /> : detail.data && summary.data ? <div className="space-y-5"><p className="text-sm text-muted-foreground">{detail.data.description ?? "Sin descripción"}</p><dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm"><div><dt className="text-xs text-muted-foreground">Venta neta</dt><dd className="mt-1 font-mono">C$ {money.format(summary.data.totals.netSalesMiles * 1000)}</dd></div><div><dt className="text-xs text-muted-foreground">Premios pagados</dt><dd className="mt-1 font-mono">C$ {money.format(summary.data.totals.paidPrizesMiles * 1000)}</dd></div><div><dt className="text-xs text-muted-foreground">Saldo</dt><dd className="mt-1 font-mono">C$ {money.format(summary.data.totals.balanceMiles * 1000)}</dd></div><div><dt className="text-xs text-muted-foreground">Vendedores</dt><dd className="mt-1">{summary.data.sellers.length}</dd></div></dl><div className="space-y-2">{summary.data.sellers.map((seller) => <article key={seller.sellerId} className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm">{seller.sellerName}</span><span className="font-mono text-sm">C$ {money.format(seller.balanceMiles * 1000)}</span></div><p className="mt-2 text-xs text-muted-foreground">Venta neta C$ {money.format(seller.netSalesMiles * 1000)} · Premios C$ {money.format(seller.paidPrizesMiles * 1000)}</p></article>)}</div></div> : null}
    </OperationDetailDrawer>
  </>;
}
