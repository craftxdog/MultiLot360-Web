"use client";

import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Clipboard,
  CreditCard,
  FileCheck2,
  FileText,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  Paperclip,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { browserHttp } from "@/lib/api/browser-http";
import { cn } from "@/lib/utils";
import type {
  BillingBankAccount,
  BillingInvoice,
  BillingPortal,
  TransferSubmission,
} from "../types/billing.types";
import { formatBillingDate, formatBillingMoney } from "../utils/billing-formatters";
import { BillingStatusBadge } from "./billing-status-badge";

function statusTone(status: string) {
  if (["ACTIVO", "ACTIVA", "PAGADA", "COMPLETADA"].includes(status)) return "text-emerald-600 dark:text-emerald-400";
  if (["MOROSA", "PENDIENTE_PAGO", "INCOMPLETA", "ABIERTA"].includes(status)) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof CreditCard }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{label}</span><Icon className="h-4 w-4" />
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
      {copied ? "Copiado" : label}
    </button>
  );
}

function EvidenceUpload({ submission, onCompleted }: { submission: TransferSubmission; onCompleted: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="mt-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const file = form.get("file");
        if (!(file instanceof File) || !file.size) {
          toast.error("Selecciona un comprobante.");
          return;
        }
        setPending(true);
        try {
          await browserHttp(`/api/billing/transfers/${submission.id}/evidence`, { method: "POST", body: form });
          toast.success("Comprobante protegido y enviado a revisión.");
          await onCompleted();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "No fue posible subir el comprobante.");
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <Upload className="mt-1 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <Label htmlFor={`evidence-${submission.id}`} className="text-xs">Adjuntar comprobante</Label>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">PDF, JPG o PNG real · máximo 10 MB. La API valida también la firma binaria.</p>
          <input id={`evidence-${submission.id}`} name="file" type="file" required accept="application/pdf,image/jpeg,image/png" disabled={pending} className="mt-3 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-xs file:text-foreground" />
          <Button type="submit" variant="secondary" disabled={pending} className="mt-3 h-9 w-full text-xs">
            {pending ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-2 h-3.5 w-3.5" />}
            {pending ? "Protegiendo archivo..." : "Enviar a revisión"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function BankAccountCard({ account }: { account: BillingBankAccount }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background"><Landmark className="h-4 w-4" /></span>
          <div>
            <p className="text-sm font-medium">{account.bank}</p>
            <p className="text-xs text-muted-foreground">{account.accountType} · {account.currency}</p>
          </div>
        </div>
        <CopyButton value={account.accountNumber} />
      </div>
      <div className="mt-4 grid gap-2 text-xs">
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Titular</span><span className="text-right">{account.holder}</span></div>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Cuenta</span><span className="font-mono text-right">{account.accountNumber}</span></div>
      </div>
      {account.instructions ? <p className="mt-3 border-t border-border pt-3 text-[11px] leading-4 text-muted-foreground">{account.instructions}</p> : null}
    </div>
  );
}

function TransferForm({ invoice, account, onCompleted }: { invoice: BillingInvoice; account: BillingBankAccount; onCompleted: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="mt-4 space-y-4 rounded-2xl border border-border bg-background p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const transferredAt = String(values.get("transferredAt") ?? "");
        setPending(true);
        try {
          await browserHttp("/api/billing/transfers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoiceId: invoice.id,
              bankAccountId: account.id,
              reference: String(values.get("reference") ?? "") || undefined,
              amountMinor: invoice.totalMinor,
              currency: invoice.currency,
              transferredAt: new Date(transferredAt).toISOString(),
              payerName: String(values.get("payerName") ?? ""),
              sourceAccountLast4: String(values.get("sourceAccountLast4") ?? "") || undefined,
            }),
          });
          toast.success("Transferencia declarada. Ahora adjunta el comprobante.");
          await onCompleted();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "No fue posible declarar la transferencia.");
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Declarar transferencia</p>
          <p className="mt-1 text-xs text-muted-foreground">El monto y la moneda se cotejan contra el documento.</p>
        </div>
        <span className="font-mono text-sm font-semibold">{formatBillingMoney(invoice.totalMinor, invoice.currency)}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="payerName" className="text-xs text-muted-foreground">Nombre del ordenante</Label>
          <Input id="payerName" name="payerName" placeholder="Nombre en la cuenta origen" required minLength={2} maxLength={160} disabled={pending} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="transferredAt" className="text-xs text-muted-foreground">Fecha y hora</Label>
          <Input id="transferredAt" name="transferredAt" type="datetime-local" required disabled={pending} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="reference" className="text-xs text-muted-foreground">Referencia declarada <span className="font-normal">(opcional)</span></Label>
          <Input id="reference" name="reference" placeholder="TRX-123456" maxLength={120} disabled={pending} className="mt-2 font-mono" />
        </div>
        <div>
          <Label htmlFor="sourceAccountLast4" className="text-xs text-muted-foreground">Últimos 4 de cuenta <span className="font-normal">(opcional)</span></Label>
          <Input id="sourceAccountLast4" name="sourceAccountLast4" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="1234" disabled={pending} className="mt-2 font-mono" />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-muted/45 p-3 text-[11px] leading-4 text-muted-foreground">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        No ingreses credenciales bancarias, PIN, CVV ni datos completos de tarjetas.
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
        {pending ? "Validando declaración..." : "Continuar al comprobante"}
      </Button>
    </form>
  );
}

export function BillingPortalWorkspace({ initialPortal }: { initialPortal: BillingPortal }) {
  const [portal, setPortal] = useState(initialPortal);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const subscription = portal.subscription;
  const invoices = portal.invoices;
  const payableInvoice = invoices.find((invoice) => ["ABIERTA", "FALLIDA"].includes(invoice.status));
  const matchingBankAccount = payableInvoice
    ? portal.bankAccounts.find((account) => account.currency === payableInvoice.currency)
    : undefined;
  const submissionsByInvoice = useMemo(
    () => new Map(portal.transferSubmissions.map((submission) => [submission.invoiceId, submission])),
    [portal.transferSubmissions],
  );
  const activeSubmission = payableInvoice ? submissionsByInvoice.get(payableInvoice.id) : undefined;

  async function refresh() {
    setRefreshing(true);
    try {
      setPortal(await browserHttp<BillingPortal>("/api/billing/portal"));
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/4 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--foreground)_0%,transparent_68%)] opacity-[0.045]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />Portal seguro del tenant
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl">Suscripción y facturación</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gestiona el acceso SaaS de <span className="font-medium text-foreground">{portal.tenant.name}</span>, sus documentos de cobro y comprobantes sin mezclar información de otras empresas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex h-10 items-center rounded-xl border border-border bg-background px-3 text-xs font-medium", statusTone(portal.tenant.status))}>
              {portal.tenant.status.replaceAll("_", " ")}
            </span>
            <Button variant="secondary" onClick={() => void refresh()} disabled={refreshing} className="h-10 px-3">
              <RefreshCw className={cn("mr-2 h-3.5 w-3.5", refreshing && "animate-spin")} />Actualizar
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de suscripción">
        <Metric label="Plan actual" value={subscription?.plan.name ?? "Pendiente"} detail={subscription ? `${subscription.interval.toLowerCase()} · ${subscription.provider}` : "Completa el primer pago"} icon={CreditCard} />
        <Metric label="Cuota" value={subscription ? formatBillingMoney(subscription.amountMinor, subscription.currency) : "—"} detail="El sistema no acepta pagos parciales ni conversión" icon={ReceiptText} />
        <Metric label="Usuarios" value={String(subscription?.plan.limits.usuarios ?? "A medida")} detail={`${subscription?.plan.limits.vendedores ?? "A medida"} vendedores incluidos`} icon={Users} />
        <Metric label="Próximo corte" value={subscription?.periodEndsAt ? formatBillingDate(subscription.periodEndsAt) : "Al activar"} detail={subscription?.cancelAtPeriodEnd ? "Cancelación al cierre solicitada" : "Renovación gestionada por el ciclo SaaS"} icon={CalendarClock} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Acceso contratado</p>
                <p className="mt-1 text-xs text-muted-foreground">Capacidades habilitadas por el catálogo.</p>
              </div>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {subscription
                ? Object.entries(subscription.plan.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs">
                      {enabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="capitalize">{feature.replaceAll("_", " ")}</span>
                    </div>
                  ))
                : <p className="text-sm text-muted-foreground">El acceso se activa después de confirmar el pago.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Documentos de cobro</p>
                <p className="mt-1 text-xs text-muted-foreground">Historial comercial emitido por AlphaBy.</p>
              </div>
              {!invoices.length ? (
                <Button
                  onClick={async () => {
                    setCreatingInvoice(true);
                    try {
                      await browserHttp("/api/billing/invoices/initial", { method: "POST" });
                      toast.success("Documento inicial generado.");
                      await refresh();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "No fue posible generar el documento.");
                    } finally {
                      setCreatingInvoice(false);
                    }
                  }}
                  disabled={creatingInvoice}
                  className="h-9 px-3 text-xs"
                >
                  {creatingInvoice ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-2 h-3.5 w-3.5" />}
                  Generar inicial
                </Button>
              ) : null}
            </div>
            <div className="mt-5 space-y-3">
              {invoices.length ? invoices.map((invoice) => (
                <article key={invoice.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-medium">{invoice.number}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Vence {formatBillingDate(invoice.dueAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatBillingMoney(invoice.totalMinor, invoice.currency)}</p>
                      <p className={cn("mt-1 text-[11px] font-medium", statusTone(invoice.status))}>{invoice.status}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="truncate font-mono text-[10px] text-muted-foreground">Ref. {invoice.bankReference}</span>
                    <CopyButton value={invoice.bankReference} label="Copiar referencia" />
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <FileText className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-3 text-sm">Aún no hay documentos emitidos.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Verifica primero el correo del propietario.</p>
                </div>
              )}
            </div>
            <p className="mt-4 text-[11px] leading-4 text-muted-foreground">{portal.policy.documentDisclaimer}</p>
          </section>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Centro de pago</p>
              <p className="mt-1 text-xs text-muted-foreground">Transferencia principal con conciliación manual segura.</p>
            </div>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </div>

          {matchingBankAccount ? <div className="mt-5"><BankAccountCard account={matchingBankAccount} /></div> : null}

          {payableInvoice && matchingBankAccount && !activeSubmission ? (
            <TransferForm invoice={payableInvoice} account={matchingBankAccount} onCompleted={refresh} />
          ) : null}

          {activeSubmission ? (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Transferencia declarada</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatBillingDate(activeSubmission.transferredAt)} · {activeSubmission.payerName}</p>
                </div>
                <BillingStatusBadge status={activeSubmission.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                <div><p className="text-muted-foreground">Monto</p><p className="mt-1 font-medium">{formatBillingMoney(activeSubmission.amountMinor, activeSubmission.currency)}</p></div>
                <div><p className="text-muted-foreground">Referencia</p><p className="mt-1 truncate font-mono">{activeSubmission.declaredReference ?? "Sin referencia"}</p></div>
              </div>
              {activeSubmission.evidence.length ? (
                <div className="mt-4 space-y-2">
                  {activeSubmission.evidence.map((evidence) => (
                    <div key={evidence.id} className="flex items-center gap-2 rounded-xl bg-muted/45 px-3 py-2.5 text-xs">
                      <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" /><span className="min-w-0 flex-1 truncate">{evidence.originalName}</span><span className="text-[10px] text-muted-foreground">Protegido</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {activeSubmission.status === "PENDIENTE_EVIDENCIA" ? <EvidenceUpload submission={activeSubmission} onCompleted={refresh} /> : null}
            </div>
          ) : null}

          {!payableInvoice ? (
            <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
              <p className="mt-3 text-sm font-medium">No hay cobros pendientes</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Los próximos documentos serán emitidos por el ciclo de facturación.</p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3 text-[11px] leading-4 text-muted-foreground"><ShieldCheck className="mb-2 h-3.5 w-3.5 text-foreground" />Aislamiento por tenant y RLS</div>
            <div className="rounded-xl border border-border p-3 text-[11px] leading-4 text-muted-foreground"><FileCheck2 className="mb-2 h-3.5 w-3.5 text-foreground" />Evidencia privada y firmada</div>
            <div className="rounded-xl border border-border p-3 text-[11px] leading-4 text-muted-foreground"><RefreshCw className="mb-2 h-3.5 w-3.5 text-foreground" />Revisión objetivo: {portal.policy.reviewTargetHours} h</div>
          </div>
        </section>
      </div>
    </div>
  );
}
