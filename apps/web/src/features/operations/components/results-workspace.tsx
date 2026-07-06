"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUrlQuery } from "../hooks/use-url-query";
import {
  operationKeys,
  resultOptions,
  resultsOptions,
  winningSalesOptions,
} from "../queries/operations.queries";
import { operationsService } from "../services/operations.service";
import { resultsQuerySchema } from "../utils/operations-query";
import { OperationDetailDrawer } from "./operation-detail-drawer";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  OperationsShell,
} from "./operations-shell";

export function ResultsWorkspace() {
  const { query, update, pathname } = useUrlQuery(resultsQuerySchema);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const result = useQuery(resultsOptions(query));
  const detail = useQuery(resultOptions(selectedId ?? ""));
  const winners = useQuery(
    winningSalesOptions(selectedId ?? "", { page: 1, limit: 100 }),
  );
  const user = useCurrentUser();
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: operationsService.createResult,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: operationKeys.results });
      toast.success("Resultado registrado");
    },
    onError: (error) => toast.error(error.message),
  });

  const filters = (
    <form
      className="grid gap-2 md:grid-cols-3 xl:grid-cols-7"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        update({
          date: String(form.get("date") || "") || undefined,
          drawCode: String(form.get("drawCode") || "") || undefined,
          winningNumber: String(form.get("winningNumber") || "") || undefined,
          shiftId: String(form.get("shiftId") || "") || undefined,
          createdByUserId: String(form.get("createdByUserId") || "") || undefined,
          sortBy: String(form.get("sortBy")) as typeof query.sortBy,
        });
      }}
    >
      <Input name="date" type="date" defaultValue={query.date} aria-label="Fecha" />
      <Input name="drawCode" defaultValue={query.drawCode} placeholder="Sorteo" />
      <Input name="winningNumber" defaultValue={query.winningNumber} placeholder="Número ganador" inputMode="numeric" maxLength={2} />
      <Input name="shiftId" defaultValue={query.shiftId} placeholder="ID turno" />
      <Input name="createdByUserId" defaultValue={query.createdByUserId} placeholder="ID creador" />
      <select name="sortBy" defaultValue={query.sortBy} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">
        <option value="createdAt">Más recientes</option>
        <option value="date">Fecha</option>
        <option value="winningNumber">Número</option>
        <option value="drawCode">Sorteo</option>
      </select>
      <Button type="submit" variant="secondary">Aplicar</Button>
    </form>
  );

  const actions = user.data?.permissions.includes("resultados.create") ? (
    <details className="relative">
      <summary className="cursor-pointer list-none">
        <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Registrar</span>
      </summary>
      <form
        className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            shiftId: String(form.get("shiftId")),
            winningNumber: String(form.get("winningNumber")).replace(/\D/g, "").padStart(2, "0"),
          });
        }}
      >
        <Input name="shiftId" placeholder="ID del turno cerrado" required />
        <Input name="winningNumber" placeholder="Número 00–99" inputMode="numeric" maxLength={2} required />
        <Button type="submit" className="w-full" disabled={create.isPending}>Confirmar resultado</Button>
      </form>
    </details>
  ) : null;

  return (
    <>
      <OperationsShell
        eyebrow="Cierre y ganadores"
        title="Resultados"
        description="Registra el número ganador de un turno cerrado y revisa premios pendientes o pagados."
        actions={actions}
        filters={filters}
      >
        {result.isLoading ? <LoadingRows /> : result.error ? (
          <ErrorState message={result.error.message} />
        ) : !result.data?.data.length ? (
          <EmptyState>No hay resultados con estos filtros.</EmptyState>
        ) : (
          <div className="space-y-2">
            {result.data.data.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="grid w-full gap-3 rounded-xl border border-border p-4 text-left transition hover:bg-accent md:grid-cols-[80px_1fr_repeat(3,auto)_24px] md:items-center"
              >
                <span className="font-mono text-3xl">{item.winningNumber}</span>
                <span><span className="block text-sm font-medium">{item.shift.configuration.code}</span><span className="block text-xs text-muted-foreground">{item.shift.date} · {item.shift.status}</span></span>
                <span className="text-xs">{item.winnerSummary.winningSalesCount} ganadores</span>
                <span className="text-xs text-amber-500">{item.winnerSummary.pendingSalesCount} pendientes</span>
                <span className="font-mono text-xs">{item.winnerSummary.totalPrizeMiles.toFixed(2)} mil</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
        {result.data ? <DataPagination basePath={pathname} params={query} pagination={result.data.pagination} itemLabel="resultados" /> : null}
      </OperationsShell>

      <OperationDetailDrawer
        open={Boolean(selectedId)}
        eyebrow="Resultado y ventas ganadoras"
        title={detail.data ? `${detail.data.shift.configuration.code} · ${detail.data.winningNumber}` : "Cargando resultado…"}
        onClose={() => setSelectedId(null)}
      >
        {detail.error ? <ErrorState message={detail.error.message} /> : detail.isLoading ? <LoadingRows /> : detail.data ? (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <div><dt className="text-xs text-muted-foreground">Fecha</dt><dd className="mt-1">{detail.data.shift.date}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Estado</dt><dd className="mt-1">{detail.data.shift.status}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Premio total</dt><dd className="mt-1 font-mono">{detail.data.winnerSummary.totalPrizeMiles.toFixed(2)} mil</dd></div>
              <div><dt className="text-xs text-muted-foreground">Pendientes</dt><dd className="mt-1">{detail.data.winnerSummary.pendingSalesCount}</dd></div>
            </dl>
            <div>
              <h3 className="text-sm font-medium">Ventas ganadoras</h3>
              {winners.error ? <div className="mt-3"><ErrorState message={winners.error.message} /></div> : winners.isLoading ? <div className="mt-3"><LoadingRows /></div> : !winners.data?.data.length ? <p className="mt-3 text-sm text-muted-foreground">No hay ventas ganadoras.</p> : (
                <div className="mt-3 space-y-2">
                  {winners.data.data.map((winner) => (
                    <article key={winner.saleId} className="rounded-xl border border-border p-3 text-sm">
                      <div className="flex items-center justify-between gap-3"><span>{winner.seller.name}</span><span className={winner.paid ? "text-emerald-500" : "text-amber-500"}>{winner.paid ? "Pagado" : "Pendiente"}</span></div>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{winner.saleId}</p>
                      <p className="mt-2 font-mono">{winner.winningPrizeMiles.toFixed(2)} mil</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </OperationDetailDrawer>
    </>
  );
}
