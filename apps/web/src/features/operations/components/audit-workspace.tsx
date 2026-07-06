"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { UserEntityCombobox } from "@/features/shared/components/api-entity-comboboxes";
import { useUrlQuery } from "../hooks/use-url-query";
import { auditEventOptions, auditOptions } from "../queries/operations.queries";
import { auditQuerySchema } from "../utils/operations-query";
import { OperationDetailDrawer } from "./operation-detail-drawer";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

export function AuditWorkspace() {
  const { query, update, pathname } = useUrlQuery(auditQuerySchema);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = useQuery(auditOptions(query));
  const detail = useQuery(auditEventOptions(selectedId ?? ""));
  const filters = (
    <form className="grid gap-2 md:grid-cols-3 xl:grid-cols-6" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      update({
        event: String(form.get("event") || "") || undefined,
        userId: String(form.get("userId") || "") || undefined,
        createdFrom: String(form.get("createdFrom") || "") || undefined,
        createdUntil: String(form.get("createdUntil") || "") || undefined,
        sortBy: String(form.get("sortBy")) as typeof query.sortBy,
      });
    }}>
      <Input name="event" placeholder="Tipo de evento" defaultValue={query.event} />
      <UserEntityCombobox name="userId" value={query.userId} placeholder="Actor" />
      <Input name="createdFrom" type="date" defaultValue={query.createdFrom} />
      <Input name="createdUntil" type="date" defaultValue={query.createdUntil} />
      <select name="sortBy" defaultValue={query.sortBy} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="createdAt">Fecha</option><option value="event">Evento</option><option value="id">ID</option></select>
      <Button type="submit" variant="secondary">Aplicar</Button>
    </form>
  );

  return <>
    <OperationsShell eyebrow="Trazabilidad segura" title="Auditoría" description="Consulta eventos HTTP y de dominio sin exponer contraseñas, códigos ni tokens." filters={filters}>
      {list.isLoading ? <LoadingRows /> : list.error ? <ErrorState message={list.error.message} /> : !list.data?.data.length ? <EmptyState>No hay eventos con estos filtros.</EmptyState> : <div className="space-y-2">{list.data.data.map((auditEvent) => <button key={auditEvent.id} type="button" onClick={() => setSelectedId(auditEvent.id)} className="grid w-full gap-2 rounded-xl border border-border p-4 text-left transition hover:bg-accent md:grid-cols-[1fr_auto_auto_24px] md:items-center"><span className="font-mono text-xs">{auditEvent.event}</span><span className="text-xs text-muted-foreground">{auditEvent.actor?.name ?? auditEvent.actor?.username ?? "Sistema"}</span><time className="text-xs text-muted-foreground">{new Date(auditEvent.createdAt).toLocaleString("es-NI")}</time><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>)}</div>}
      {list.data ? <DataPagination basePath={pathname} params={query} pagination={list.data.pagination} itemLabel="eventos" /> : null}
    </OperationsShell>
    <OperationDetailDrawer open={Boolean(selectedId)} eyebrow="Evento auditado" title={detail.data?.event ?? "Cargando evento…"} onClose={() => setSelectedId(null)}>
      {detail.error ? <ErrorState message={detail.error.message} /> : detail.isLoading ? <LoadingRows /> : detail.data ? <div className="space-y-4"><dl className="rounded-2xl border border-border bg-card p-4 text-sm"><dt className="text-xs text-muted-foreground">Actor</dt><dd className="mt-1">{detail.data.actor?.name ?? detail.data.actor?.username ?? "Sistema"}</dd><dt className="mt-4 text-xs text-muted-foreground">Fecha</dt><dd className="mt-1">{new Date(detail.data.createdAt).toLocaleString("es-NI")}</dd><dt className="mt-4 text-xs text-muted-foreground">ID</dt><dd className="mt-1 break-all font-mono text-xs">{detail.data.id}</dd></dl><pre className="max-h-[55vh] overflow-auto rounded-xl bg-muted p-4 text-[11px]">{JSON.stringify(detail.data.payload, null, 2)}</pre></div> : null}
    </OperationDetailDrawer>
  </>;
}
