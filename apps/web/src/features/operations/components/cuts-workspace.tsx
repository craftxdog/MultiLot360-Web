"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUrlQuery } from "../hooks/use-url-query";
import { cutsOptions, operationKeys } from "../queries/operations.queries";
import { operationsService } from "../services/operations.service";
import { cutsQuerySchema } from "../utils/operations-query";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

export function CutsWorkspace() {
  const { query, update, pathname } = useUrlQuery(cutsQuerySchema);
  const list = useQuery(cutsOptions(query));
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
    <details className="relative"><summary className="cursor-pointer list-none"><Button className="h-9" tabIndex={-1}>Nuevo corte</Button></summary><form className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xl" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); create.mutate({ startDate: String(form.get("startDate")), endDate: String(form.get("endDate")), description: String(form.get("description") ?? "") || undefined, visibleToSellers: form.get("visibleToSellers") === "on" }); }}><Input name="startDate" type="date" required /><Input name="endDate" type="date" required /><Input name="description" placeholder="Descripción opcional" /><label className="flex items-center gap-2 text-xs"><input name="visibleToSellers" type="checkbox" defaultChecked />Visible para vendedores</label><Button type="submit" className="w-full">Crear corte</Button></form></details>
  ) : null;

  return <OperationsShell eyebrow="Conciliación" title="Cortes de caja" description="Consolida ventas, anulaciones, premios y saldo por período sin perder trazabilidad." actions={actions} filters={filters}>
    {list.isLoading ? <LoadingRows /> : list.error ? <ErrorState message={list.error.message} /> : !list.data?.data.length ? <EmptyState>No hay cortes con estos filtros.</EmptyState> : <div className="space-y-2">{list.data.data.map((cut) => <article key={cut.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto_auto] md:items-center"><div><p className="text-sm font-medium">{cut.startDate} — {cut.endDate}</p><p className="mt-1 text-xs text-muted-foreground">{cut.description ?? "Sin descripción"}</p></div><span className="rounded-full border border-border px-3 py-1 text-xs">{cut.visibleToSellers ? "Visible" : "Interno"}</span><span className="text-xs text-muted-foreground">{cut.createdBy?.name ?? cut.createdBy?.username ?? "Sistema"}</span></article>)}</div>}
    {list.data ? <DataPagination basePath={pathname} params={query} pagination={list.data.pagination} itemLabel="cortes" /> : null}
  </OperationsShell>;
}
