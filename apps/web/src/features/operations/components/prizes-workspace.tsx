"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EntityCombobox } from "@/components/ui/entity-combobox";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { SellerEntityCombobox } from "@/features/shared/components/api-entity-comboboxes";
import { useUrlQuery } from "../hooks/use-url-query";
import { operationKeys, prizeOptions, prizesOptions, resultsOptions, winningSalesOptions } from "../queries/operations.queries";
import { operationsService } from "../services/operations.service";
import { prizesQuerySchema } from "../utils/operations-query";
import { OperationDetailDrawer } from "./operation-detail-drawer";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

const money = new Intl.NumberFormat("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ResultEntityCombobox({ name, value, placeholder = "Resultado" }: { name: string; value?: string; placeholder?: string }) {
  const results = useQuery(resultsOptions({ page: 1, limit: 100, sortBy: "createdAt", sortDirection: "desc" }));
  const options = (results.data?.data ?? []).map((result) => ({
    value: result.id,
    label: `${result.shift.configuration.code} · ${result.winningNumber}`,
    description: `${result.shift.date} · ${result.shift.status}`,
  }));
  return <EntityCombobox name={name} value={value} options={options} placeholder={placeholder} ariaLabel={placeholder} emptyLabel={results.isLoading ? "Cargando resultados…" : "Sin resultados disponibles"} />;
}

export function PrizesWorkspace() {
  const { query, update, pathname } = useUrlQuery(prizesQuerySchema);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [payResultId, setPayResultId] = useState("");
  const [paySaleId, setPaySaleId] = useState("");
  const list = useQuery(prizesOptions(query));
  const detail = useQuery(prizeOptions(selectedSaleId ?? ""));
  const recentResults = useQuery(resultsOptions({ page: 1, limit: 100, sortBy: "createdAt", sortDirection: "desc" }));
  const pendingWinners = useQuery(winningSalesOptions(payResultId, { page: 1, limit: 100, paid: false }));
  const user = useCurrentUser();
  const client = useQueryClient();
  const pay = useMutation({
    mutationFn: operationsService.payPrize,
    onSuccess: () => {
      setPayResultId("");
      setPaySaleId("");
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
      <SellerEntityCombobox name="sellerId" value={query.sellerId} placeholder="Vendedor" />
      <ResultEntityCombobox name="resultId" value={query.resultId} />
      <div className="flex gap-2"><DateRangePicker className="min-w-0 flex-1" fromName="paidFrom" toName="paidUntil" from={query.paidFrom} to={query.paidUntil} placeholder="Rango de pago" /><Button type="submit" variant="secondary">Filtrar</Button></div>
    </form>
  );

  const actions = user.data?.permissions.includes("pagos_premios.create") ? (
    <details className="relative">
      <summary className="cursor-pointer list-none"><span className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Pagar</span></summary>
      <form className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xl" onSubmit={(event) => {
        event.preventDefault();
        if (!payResultId || !paySaleId) {
          toast.error("Selecciona un resultado y una venta ganadora.");
          return;
        }
        pay.mutate({ resultId: payResultId, saleId: paySaleId });
      }}>
        <select value={payResultId} onChange={(event) => { setPayResultId(event.target.value); setPaySaleId(""); }} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
          <option value="">{recentResults.isLoading ? "Cargando resultados…" : "Selecciona resultado"}</option>
          {recentResults.data?.data.map((result) => <option key={result.id} value={result.id}>{result.shift.configuration.code} · {result.winningNumber} · {result.shift.date}</option>)}
        </select>
        <select value={paySaleId} onChange={(event) => setPaySaleId(event.target.value)} disabled={!payResultId || pendingWinners.isLoading} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
          <option value="">{!payResultId ? "Selecciona resultado primero" : pendingWinners.isLoading ? "Cargando ganadores…" : "Selecciona venta ganadora"}</option>
          {pendingWinners.data?.data.map((winner) => <option key={winner.saleId} value={winner.saleId}>{winner.seller.name} · C$ {money.format(winner.winningPrizeMiles * 1000)}</option>)}
        </select>
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
