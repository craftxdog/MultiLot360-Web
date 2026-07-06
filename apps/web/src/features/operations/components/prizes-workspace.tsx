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
import { operationKeys, prizeOptions, prizesOptions } from "../queries/operations.queries";
import { operationsService } from "../services/operations.service";
import { prizesQuerySchema } from "../utils/operations-query";
import { OperationDetailDrawer } from "./operation-detail-drawer";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

const money = new Intl.NumberFormat("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PrizesWorkspace() {
  const { query, update, pathname } = useUrlQuery(prizesQuerySchema);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const list = useQuery(prizesOptions(query));
  const detail = useQuery(prizeOptions(selectedSaleId ?? ""));
  const user = useCurrentUser();
  const client = useQueryClient();
  const pay = useMutation({
    mutationFn: operationsService.payPrize,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: operationKeys.prizes });
      void client.invalidateQueries({ queryKey: operationKeys.results });
      toast.success("Premio pagado y auditado");
    },
    onError: (error) => toast.error(error.message),
  });

  const filters = (
    <form className="grid gap-2 md:grid-cols-3 xl:grid-cols-6" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      update({
        date: String(form.get("date") || "") || undefined,
        drawCode: String(form.get("drawCode") || "") || undefined,
        sellerId: String(form.get("sellerId") || "") || undefined,
        resultId: String(form.get("resultId") || "") || undefined,
        paidFrom: String(form.get("paidFrom") || "") || undefined,
        paidUntil: String(form.get("paidUntil") || "") || undefined,
      });
    }}>
      <Input name="date" type="date" defaultValue={query.date} />
      <Input name="drawCode" placeholder="Sorteo" defaultValue={query.drawCode} />
      <Input name="sellerId" placeholder="ID vendedor" defaultValue={query.sellerId} />
      <Input name="resultId" placeholder="ID resultado" defaultValue={query.resultId} />
      <Input name="paidFrom" type="date" defaultValue={query.paidFrom} />
      <div className="flex gap-2"><Input name="paidUntil" type="date" defaultValue={query.paidUntil} /><Button type="submit" variant="secondary">Filtrar</Button></div>
    </form>
  );

  const actions = user.data?.permissions.includes("pagos_premios.create") ? (
    <details className="relative">
      <summary className="cursor-pointer list-none"><span className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Pagar</span></summary>
      <form className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xl" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        pay.mutate({ resultId: String(form.get("resultId")), saleId: String(form.get("saleId")) });
      }}>
        <Input name="resultId" placeholder="ID resultado" required />
        <Input name="saleId" placeholder="ID venta ganadora" required />
        <Button type="submit" className="w-full" disabled={pay.isPending}>Confirmar pago</Button>
      </form>
    </details>
  ) : null;

  return (
    <>
      <OperationsShell eyebrow="Control contable" title="Pago de premios" description="Confirma cada pago una sola vez y conserva vínculo con venta, resultado y operador." actions={actions} filters={filters}>
        {list.isLoading ? <LoadingRows /> : list.error ? <ErrorState message={list.error.message} /> : !list.data?.data.length ? <EmptyState>No hay pagos con estos filtros.</EmptyState> : (
          <div className="space-y-2">
            {list.data.data.map((payment) => (
              <button key={payment.saleId} type="button" onClick={() => setSelectedSaleId(payment.saleId)} className="grid w-full gap-3 rounded-xl border border-border p-4 text-left transition hover:bg-accent md:grid-cols-[1fr_repeat(3,auto)_24px] md:items-center">
                <span><span className="block text-sm font-medium">{payment.sale.seller.name}</span><span className="block font-mono text-[11px] text-muted-foreground">Venta {payment.saleId}</span></span>
                <span className="font-mono text-sm">Nº {payment.result.winningNumber}</span>
                <span className="font-mono text-sm">C$ {money.format(payment.paidAmountMiles * 1000)}</span>
                <time className="text-xs text-muted-foreground">{new Date(payment.paidAt).toLocaleString("es-NI")}</time>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
        {list.data ? <DataPagination basePath={pathname} params={query} pagination={list.data.pagination} itemLabel="pagos" /> : null}
      </OperationsShell>

      <OperationDetailDrawer open={Boolean(selectedSaleId)} eyebrow="Comprobante de premio" title={detail.data ? detail.data.sale.seller.name : "Cargando pago…"} onClose={() => setSelectedSaleId(null)}>
        {detail.error ? <ErrorState message={detail.error.message} /> : detail.isLoading ? <LoadingRows /> : detail.data ? (
          <dl className="space-y-4 rounded-2xl border border-border bg-card p-4 text-sm">
            <div><dt className="text-xs text-muted-foreground">Venta</dt><dd className="mt-1 break-all font-mono">{detail.data.saleId}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Resultado</dt><dd className="mt-1">{detail.data.result.shift.configuration.code} · número {detail.data.result.winningNumber}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Monto pagado</dt><dd className="mt-1 font-mono">C$ {money.format(detail.data.paidAmountMiles * 1000)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Confirmado por</dt><dd className="mt-1">{detail.data.paidBy?.name ?? detail.data.paidBy?.username ?? "Sistema"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Fecha</dt><dd className="mt-1">{new Date(detail.data.paidAt).toLocaleString("es-NI")}</dd></div>
          </dl>
        ) : null}
      </OperationDetailDrawer>
    </>
  );
}
