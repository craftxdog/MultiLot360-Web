"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, Plus } from "lucide-react";
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
import type { WinningSale } from "../types/operations.types";
import { prizesQuerySchema } from "../utils/operations-query";
import { OperationDetailDrawer } from "./operation-detail-drawer";
import { EmptyState, ErrorState, LoadingRows, OperationsShell } from "./operations-shell";

const money = new Intl.NumberFormat("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ResultEntityCombobox({ name, value, placeholder = "Resultado", onValueChange }: { name: string; value?: string; placeholder?: string; onValueChange?: (value: string) => void }) {
  const results = useQuery(resultsOptions({ page: 1, limit: 100, sortBy: "createdAt", sortDirection: "desc" }));
  const options = (results.data?.data ?? []).map((result) => ({
    value: result.id,
    label: `${result.shift.configuration.code} · ${result.winningNumber}`,
    description: `${result.shift.date} · ${result.shift.status}`,
  }));
  return <EntityCombobox name={name} value={value} options={options} placeholder={placeholder} ariaLabel={placeholder} onValueChange={onValueChange} emptyLabel={results.isLoading ? "Cargando resultados…" : "Sin resultados disponibles"} />;
}

function WinningSaleEntityCombobox({
  name,
  value,
  winners,
  loading,
  disabled,
  onValueChange,
}: {
  name: string;
  value?: string;
  winners: WinningSale[];
  loading: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const options = winners.map((winner) => ({
    value: winner.saleId,
    label: `${winner.seller.name} · ${money.format(winner.winningPrizeMiles * 1000)}`,
    description: `Ticket ${winner.saleId.slice(0, 8)} · ${winner.saleCreatedAt.slice(0, 10)}`,
  }));
  return <EntityCombobox name={name} value={value} options={options} placeholder="Venta ganadora pendiente" ariaLabel="Venta ganadora pendiente" disabled={disabled} onValueChange={onValueChange} emptyLabel={loading ? "Cargando ventas ganadoras…" : "Sin premios pendientes para este resultado"} />;
}

export function PrizesWorkspace() {
  const { query, update, pathname } = useUrlQuery(prizesQuerySchema);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [payResultId, setPayResultId] = useState("");
  const [paySaleId, setPaySaleId] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [pendingPay, setPendingPay] = useState<WinningSale | null>(null);
  const list = useQuery(prizesOptions(query));
  const detail = useQuery(prizeOptions(selectedSaleId ?? ""));
  const pendingWinners = useQuery(winningSalesOptions(payResultId, { page: 1, limit: 100, paid: false }));
  const user = useCurrentUser();
  const client = useQueryClient();
  const pay = useMutation({
    mutationFn: operationsService.payPrize,
    onSuccess: () => {
      setPayResultId("");
      setPaySaleId("");
      setPendingPay(null);
      setPayOpen(false);
      void client.invalidateQueries({ queryKey: operationKeys.prizes });
      void client.invalidateQueries({ queryKey: operationKeys.results });
      void client.invalidateQueries({ queryKey: operationKeys.reports });
      if (payResultId) void client.invalidateQueries({ queryKey: ["results", "winning-sales", payResultId] });
      toast.success("Premio pagado y auditado");
    },
    onError: (error) => toast.error(error.message),
  });

  const closePayDialog = () => {
    if (pay.isPending) return;
    setPayOpen(false);
    setPendingPay(null);
  };

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
    <Button type="button" className="h-9 gap-2" onClick={() => setPayOpen(true)}><Plus className="h-4 w-4" />Pagar premio</Button>
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

      {payOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closePayDialog()}>
          <section role="dialog" aria-modal="true" aria-labelledby="prize-payment-title" className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pago auditado</p>
                <h2 id="prize-payment-title" className="mt-1 text-lg font-semibold text-foreground">Marcar premio como pagado</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><AlertTriangle className="h-5 w-5" /></span>
            </div>

            <form className="mt-5 space-y-3" onSubmit={(event) => {
              event.preventDefault();
              const candidate = pendingWinners.data?.data.find((winner) => winner.saleId === paySaleId) ?? null;
              if (!payResultId || !candidate) {
                toast.error("Selecciona un resultado y una venta ganadora pendiente.");
                return;
              }
              setPendingPay(candidate);
            }}>
              <ResultEntityCombobox name="resultId" value={payResultId} placeholder="Resultado" onValueChange={(value) => { setPayResultId(value); setPaySaleId(""); setPendingPay(null); }} />
              <WinningSaleEntityCombobox
                name="saleId"
                value={paySaleId}
                winners={pendingWinners.data?.data ?? []}
                loading={pendingWinners.isLoading}
                disabled={!payResultId || pendingWinners.isLoading}
                onValueChange={(value) => { setPaySaleId(value); setPendingPay(null); }}
              />
              <Button type="submit" variant="secondary" className="w-full">Revisar pago</Button>
            </form>

            {pendingPay ? (
              <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-medium text-foreground">Confirmación final</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">La API calculará el monto y registrará auditoría. Esta acción evita doble pago y publicará el evento realtime de premio pagado.</p>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Vendedor</dt><dd className="font-medium">{pendingPay.seller.name}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Venta</dt><dd className="font-mono text-xs">{pendingPay.saleId}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Monto estimado</dt><dd className="font-mono">C$ {money.format(pendingPay.winningPrizeMiles * 1000)}</dd></div>
                </dl>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closePayDialog} disabled={pay.isPending}>Cancelar</Button>
              <Button type="button" disabled={!pendingPay || pay.isPending} onClick={() => pendingPay ? pay.mutate({ resultId: payResultId, saleId: pendingPay.saleId }) : undefined}>{pay.isPending ? "Registrando…" : "Sí, pagar premio"}</Button>
            </div>
          </section>
        </div>
      ) : null}

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
