"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileSearch,
  FileText,
  Landmark,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { browserHttp } from "@/lib/api/browser-http";
import { cn } from "@/lib/utils";
import type {
  ReviewTransferResult,
  TransferQueueItem,
  TransferQueues,
  TransferStatus,
} from "../types/billing.types";
import {
  formatBillingDate,
  formatBillingMoney,
  transferStatusLabels,
} from "../utils/billing-formatters";
import { BillingStatusBadge } from "./billing-status-badge";

const statuses: TransferStatus[] = [
  "EN_REVISION",
  "PENDIENTE_EVIDENCIA",
  "APROBADA",
  "RECHAZADA",
  "CANCELADA",
];

function compactMoney(total: number, currency: "USD" | "NIO") {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    notation: total >= 100_000_00 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(total / 100);
}

function CountCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof Users; tone?: "green" | "amber" }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <span className={cn("absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full blur-2xl", tone === "green" ? "bg-emerald-500/10" : tone === "amber" ? "bg-amber-500/10" : "bg-foreground/5")} />
      <div className="relative flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-4 w-4 text-muted-foreground" /></div>
      <p className="relative mt-5 text-3xl font-semibold tracking-tighter">{value}</p>
      <p className="relative mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

function OnboardingLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      onClick={async () => {
        const url = `${window.location.origin}${routes.signup}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Enlace de alta copiado.");
        window.setTimeout(() => setCopied(false), 1800);
      }}
      className="h-10 px-4 text-xs"
    >
      {copied ? <Check className="mr-2 h-3.5 w-3.5" /> : <UserPlus className="mr-2 h-3.5 w-3.5" />}
      {copied ? "Enlace copiado" : "Copiar alta de cliente"}
    </Button>
  );
}

function QueueItem({ item, active, onClick }: { item: TransferQueueItem; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition",
        active ? "border-foreground/25 bg-foreground text-background shadow-lg shadow-foreground/5" : "border-border bg-background hover:border-foreground/15 hover:bg-accent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.tenant.name}</p>
          <p className="mt-1 truncate font-mono text-[10px] opacity-55">{item.invoice.number}</p>
        </div>
        <p className="shrink-0 text-sm font-semibold">{formatBillingMoney(item.amountMinor, item.currency)}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] opacity-60">
        <span>{item.bankAccount.bank}</span>
        <span>{formatBillingDate(item.createdAt)}</span>
      </div>
    </button>
  );
}

function ReviewPanel({ item }: { item: TransferQueueItem }) {
  const router = useRouter();
  const [decision, setDecision] = useState<"APROBADA" | "RECHAZADA">("APROBADA");
  const [pending, setPending] = useState(false);
  const riskCount = Array.isArray(item.riskFlags)
    ? item.riskFlags.length
    : item.riskFlags
      ? Object.keys(item.riskFlags).length
      : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><BillingStatusBadge status={item.status} /><span className="font-mono text-[10px] text-muted-foreground">{item.id.slice(0, 8)}</span></div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.tenant.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{item.tenant.slug} · Tenant {item.tenant.status}</p>
        </div>
        <div className="text-left sm:text-right"><p className="text-2xl font-semibold tracking-tight">{formatBillingMoney(item.amountMinor, item.currency)}</p><p className="mt-1 text-xs text-muted-foreground">Declarado {formatBillingDate(item.transferredAt)}</p></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium"><FileText className="h-3.5 w-3.5" />Documento</div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Número</span><span className="font-mono">{item.invoice.number}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Referencia</span><span className="truncate font-mono">{item.invoice.bankReference}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Vencimiento</span><span>{formatBillingDate(item.invoice.dueAt)}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium"><Landmark className="h-3.5 w-3.5" />Declaración bancaria</div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Ordenante</span><span className="truncate">{item.payerName}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Referencia</span><span className="truncate font-mono">{item.declaredReference ?? "—"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Cuenta origen</span><span className="font-mono">{item.sourceLast4 ? `•••• ${item.sourceLast4}` : "—"}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-medium"><FileSearch className="h-3.5 w-3.5" />Evidencia privada</div><span className="text-[11px] text-muted-foreground">URL firmada por 5 minutos</span></div>
        <div className="mt-3 space-y-2">
          {item.evidence.length ? item.evidence.map((evidence) => (
            <a key={evidence.id} href={evidence.signedUrl ?? undefined} target="_blank" rel="noreferrer" className={cn("flex items-center gap-3 rounded-xl border border-border px-3 py-3 text-xs transition", evidence.signedUrl ? "hover:bg-accent" : "pointer-events-none opacity-50")}>
              <FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{evidence.originalName}</span><span className="text-[10px] text-muted-foreground">{(evidence.sizeBytes / 1024).toFixed(0)} KB</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )) : <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No hay evidencia adjunta.</p>}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[11px]"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />Monto exacto</div>
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[11px]"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />Moneda {item.currency}</div>
        <div className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px]", riskCount ? "border-amber-500/25 text-amber-700 dark:text-amber-300" : "border-border")}><ShieldCheck className="h-3.5 w-3.5" />{riskCount ? `${riskCount} alertas de riesgo` : "Sin alertas declaradas"}</div>
      </div>

      {item.status === "EN_REVISION" ? (
        <form
          className="rounded-2xl border border-border bg-background p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            setPending(true);
            try {
              await browserHttp<ReviewTransferResult>(`/api/billing/admin/transfers/${item.id}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  decision,
                  confirmedBankReference: decision === "APROBADA" ? String(values.get("confirmedBankReference") ?? "") : undefined,
                  notes: String(values.get("notes") ?? "") || undefined,
                }),
              });
              toast.success(decision === "APROBADA" ? "Pago conciliado y tenant activado." : "Transferencia rechazada con trazabilidad.");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "No fue posible registrar la revisión.");
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-medium">Decisión financiera</p><p className="mt-1 text-[11px] text-muted-foreground">La revisión es inmutable y queda ligada a tu usuario.</p></div>
            <div className="flex rounded-xl border border-border bg-muted/40 p-1">
              <button type="button" onClick={() => setDecision("APROBADA")} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition", decision === "APROBADA" ? "bg-emerald-500 text-white" : "text-muted-foreground")}><Check className="h-3 w-3" />Aprobar</button>
              <button type="button" onClick={() => setDecision("RECHAZADA")} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition", decision === "RECHAZADA" ? "bg-danger text-white" : "text-muted-foreground")}><X className="h-3 w-3" />Rechazar</button>
            </div>
          </div>
          {decision === "APROBADA" ? (
            <div className="mt-4"><Label htmlFor="confirmedBankReference" className="text-xs text-muted-foreground">Referencia confirmada en el banco</Label><Input id="confirmedBankReference" name="confirmedBankReference" required minLength={3} maxLength={160} placeholder="Referencia cotejada, no la declarada" className="mt-2 font-mono" disabled={pending} /></div>
          ) : null}
          <div className="mt-4"><Label htmlFor="notes" className="text-xs text-muted-foreground">Notas de conciliación <span className="font-normal">(opcional)</span></Label><Textarea id="notes" name="notes" maxLength={1000} placeholder="Hallazgos, motivo de rechazo o contexto para auditoría..." className="mt-2 min-h-24" disabled={pending} /></div>
          <Button type="submit" variant={decision === "APROBADA" ? "primary" : "danger"} className="mt-4 w-full" disabled={pending || !item.evidence.length}>
            {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : decision === "APROBADA" ? <BadgeCheck className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
            {pending ? "Registrando revisión atómica..." : decision === "APROBADA" ? "Confirmar fondos y activar cliente" : "Rechazar transferencia"}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">Esta declaración ya no admite decisiones. El historial financiero permanece inmutable.</div>
      )}
    </div>
  );
}

export function PlatformControlCenter({ queues }: { queues: TransferQueues }) {
  const [activeStatus, setActiveStatus] = useState<TransferStatus>("EN_REVISION");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const allItems = useMemo(() => statuses.flatMap((status) => queues[status]), [queues]);
  const distinctTenants = new Set(allItems.map((item) => item.tenant.id)).size;
  const approved = queues.APROBADA;
  const totals = approved.reduce((acc, item) => ({ ...acc, [item.currency]: acc[item.currency] + item.amountMinor }), { USD: 0, NIO: 0 });
  const visibleItems = queues[activeStatus].filter((item) => {
    const needle = query.trim().toLowerCase();
    return !needle || [item.tenant.name, item.tenant.slug, item.invoice.number, item.payerName].some((value) => value.toLowerCase().includes(needle));
  });
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.11),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="h-3.5 w-3.5" />AlphaBy control plane</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl">Centro de control SaaS</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Alta asistida de clientes, monitoreo de cobros y conciliación bancaria global. Cada decisión conserva separación entre plataforma y operación de los tenants.</p>
          </div>
          <OnboardingLinkButton />
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Clientes observados" value={String(distinctTenants)} detail="Tenants presentes en el flujo financiero actual" icon={Building2} />
        <CountCard label="Esperando revisión" value={String(queues.EN_REVISION.length)} detail="Con evidencia privada lista para conciliar" icon={Clock3} tone="amber" />
        <CountCard label="Cobros aprobados USD" value={compactMoney(totals.USD, "USD")} detail={`${approved.filter((item) => item.currency === "USD").length} pagos confirmados`} icon={CircleDollarSign} tone="green" />
        <CountCard label="Cobros aprobados NIO" value={compactMoney(totals.NIO, "NIO")} detail={`${approved.filter((item) => item.currency === "NIO").length} pagos confirmados`} icon={BadgeCheck} tone="green" />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { icon: UserPlus, title: "Alta pagada", text: "Comparte el registro con catálogo, empresa y propietario." },
          { icon: FileText, title: "Cobro por tenant", text: "El cliente emite su documento inicial desde su portal aislado." },
          { icon: ShieldCheck, title: "Activación atómica", text: "Conciliar acredita el ledger, paga el documento y activa el tenant." },
        ].map(({ icon: Icon, title, text }, index) => (
          <article key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-background"><Icon className="h-4 w-4" /></span><div><div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">0{index + 1}</span><p className="text-sm font-medium">{title}</p></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></article>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1">
              {statuses.map((status) => (
                <button key={status} type="button" onClick={() => { setActiveStatus(status); setSelectedId(null); }} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-xs transition", activeStatus === status ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {transferStatusLabels[status]} <span className="ml-1 opacity-55">{queues[status].length}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full xl:w-80"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Cliente, factura u ordenante..." className="h-10 pl-10" /></div>
          </div>
        </div>

        <div className="grid min-h-[640px] lg:grid-cols-[340px_1fr] xl:grid-cols-[400px_1fr]">
          <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center justify-between gap-3 px-1"><p className="text-xs font-medium">Cola de conciliación</p><span className="text-[11px] text-muted-foreground">{visibleItems.length} registros</span></div>
            <div className="space-y-2 lg:max-h-[710px] lg:overflow-y-auto lg:pr-1">
              {visibleItems.length ? visibleItems.map((item) => <QueueItem key={item.id} item={item} active={selected?.id === item.id} onClick={() => setSelectedId(item.id)} />) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center"><FileSearch className="mx-auto h-5 w-5 text-muted-foreground" /><p className="mt-3 text-sm">Sin movimientos en esta etapa</p><p className="mt-1 text-xs text-muted-foreground">La cola está al día.</p></div>
              )}
            </div>
          </aside>
          <div className="p-4 sm:p-6">
            {selected ? <ReviewPanel key={selected.id} item={selected} /> : (
              <div className="grid min-h-[520px] place-items-center text-center"><div><ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-4 text-sm font-medium">Selecciona un movimiento</p><p className="mt-2 text-xs text-muted-foreground">Aquí verás factura, declaración, evidencia y acciones seguras.</p></div></div>
            )}
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" />Acceso global separado del ledger de auditoría de cada tenant.</span><a href="https://dev-api.alphaby.cloud/docs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground hover:underline">Contrato API <ArrowUpRight className="h-3.5 w-3.5" /></a></footer>
    </div>
  );
}
