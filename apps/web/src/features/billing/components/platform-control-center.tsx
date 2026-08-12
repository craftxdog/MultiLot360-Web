"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  FileSearch,
  FileText,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Workflow,
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
  BillingPlan,
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
import {
  allTransferItems,
  buildObservedClients,
  primaryClientStatus,
  requestNextAction,
  requestProgress,
  type ObservedClient,
} from "../utils/platform-control-model";
import { BillingStatusBadge } from "./billing-status-badge";

const statuses: TransferStatus[] = [
  "EN_REVISION",
  "PENDIENTE_EVIDENCIA",
  "APROBADA",
  "RECHAZADA",
  "CANCELADA",
];

type PlatformView = "overview" | "requests" | "clients" | "plans" | "guide";

const platformViews: Array<{
  id: PlatformView;
  label: string;
  icon: typeof Users;
}> = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "requests", label: "Solicitudes", icon: ListChecks },
  { id: "clients", label: "Clientes", icon: Building2 },
  { id: "plans", label: "Planes y acceso", icon: PackageCheck },
  { id: "guide", label: "Guía operativa", icon: Workflow },
];

const workflowSteps = [
  {
    title: "Registro",
    detail: "El cliente elige plan, crea empresa y propietario.",
    owner: "Cliente",
  },
  {
    title: "Documento",
    detail: "El portal emite el documento comercial con monto y referencia.",
    owner: "Sistema",
  },
  {
    title: "Evidencia",
    detail: "El cliente declara la transferencia y adjunta el comprobante.",
    owner: "Cliente",
  },
  {
    title: "Decisión",
    detail: "AlphaBy coteja el banco; aprobar activa el tenant atómicamente.",
    owner: "AlphaBy",
  },
];

function compactMoney(total: number, currency: "USD" | "NIO") {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    notation: total >= 10_000_000 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(total / 100);
}

function prettifyKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CountCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone?: "green" | "amber";
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full blur-2xl",
          tone === "green"
            ? "bg-emerald-500/10"
            : tone === "amber"
              ? "bg-amber-500/10"
              : "bg-foreground/5",
        )}
      />
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="relative mt-5 text-3xl font-semibold tracking-tighter">{value}</p>
      <p className="relative mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

function OnboardingActions() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}${routes.signup}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Enlace de alta copiado.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={copy} variant="secondary" className="h-10 px-4 text-xs">
        {copied ? <Check className="mr-2 h-3.5 w-3.5" /> : <Copy className="mr-2 h-3.5 w-3.5" />}
        {copied ? "Enlace copiado" : "Copiar enlace de alta"}
      </Button>
      <a
        href={routes.signup}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-88"
      >
        <UserPlus className="mr-2 h-3.5 w-3.5" />
        Abrir alta de cliente
      </a>
    </div>
  );
}

function ViewNavigation({
  active,
  onChange,
  requestCount,
}: {
  active: PlatformView;
  onChange: (view: PlatformView) => void;
  requestCount: number;
}) {
  return (
    <nav
      aria-label="Secciones del Centro AlphaBy"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5"
    >
      {platformViews.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          onClick={() => onChange(id)}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-medium transition",
            active === id
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          {id === "requests" && requestCount ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                active === id ? "bg-background/15" : "bg-amber-500/12 text-amber-700 dark:text-amber-300",
              )}
            >
              {requestCount}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

function RequestJourney({ status }: { status: TransferStatus }) {
  const progress = requestProgress(status);
  const nextAction = requestNextAction(status);

  return (
    <section aria-label="Proceso de la solicitud" className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Proceso de la solicitud
          </p>
          <p className="mt-2 text-sm font-medium">Siguiente: {nextAction.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{nextAction.detail}</p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]">
          Responsable · {nextAction.owner}
        </span>
      </div>

      <ol className="mt-5 grid gap-2 md:grid-cols-4">
        {workflowSteps.map((step, index) => {
          const complete = index < progress;
          const current = index === progress;
          return (
            <li
              key={step.title}
              className={cn(
                "rounded-xl border p-3",
                complete
                  ? "border-emerald-500/20 bg-emerald-500/7"
                  : current
                    ? "border-amber-500/25 bg-amber-500/7"
                    : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold",
                    complete ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {complete ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <p className="text-xs font-medium">{step.title}</p>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{step.detail}</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{step.owner}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function QueueItem({
  item,
  active,
  onClick,
}: {
  item: TransferQueueItem;
  active: boolean;
  onClick: () => void;
}) {
  const action = requestNextAction(item.status);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition",
        active
          ? "border-foreground/25 bg-foreground text-background shadow-lg shadow-foreground/5"
          : "border-border bg-background hover:border-foreground/15 hover:bg-accent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.tenant.name}</p>
          <p className="mt-1 truncate font-mono text-[10px] opacity-55">{item.invoice.number}</p>
        </div>
        <p className="shrink-0 text-sm font-semibold">
          {formatBillingMoney(item.amountMinor, item.currency)}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] opacity-60">
        <span>{action.owner}: {action.title}</span>
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
          <div className="flex flex-wrap items-center gap-2">
            <BillingStatusBadge status={item.status} />
            <span className="font-mono text-[10px] text-muted-foreground">{item.id.slice(0, 8)}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.tenant.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.tenant.slug} · Tenant {item.tenant.status}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold tracking-tight">
            {formatBillingMoney(item.amountMinor, item.currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Declarado {formatBillingDate(item.transferredAt)}
          </p>
        </div>
      </div>

      <RequestJourney status={item.status} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <FileText className="h-3.5 w-3.5" />Documento comercial
          </div>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Número</dt><dd className="font-mono">{item.invoice.number}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Referencia</dt><dd className="truncate font-mono">{item.invoice.bankReference}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Vencimiento</dt><dd>{formatBillingDate(item.invoice.dueAt)}</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Landmark className="h-3.5 w-3.5" />Declaración bancaria
          </div>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Ordenante</dt><dd className="truncate">{item.payerName}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Referencia</dt><dd className="truncate font-mono">{item.declaredReference ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Cuenta origen</dt><dd className="font-mono">{item.sourceLast4 ? `•••• ${item.sourceLast4}` : "—"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium"><FileSearch className="h-3.5 w-3.5" />Evidencia privada</div>
          <span className="text-[11px] text-muted-foreground">URL firmada por 5 minutos</span>
        </div>
        <div className="mt-3 space-y-2">
          {item.evidence.length ? (
            item.evidence.map((evidence) => (
              <a
                key={evidence.id}
                href={evidence.signedUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border px-3 py-3 text-xs transition",
                  evidence.signedUrl ? "hover:bg-accent" : "pointer-events-none opacity-50",
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{evidence.originalName}</span>
                <span className="text-[10px] text-muted-foreground">{(evidence.sizeBytes / 1024).toFixed(0)} KB</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              El cliente aún no adjunta un comprobante.
            </p>
          )}
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
              await browserHttp<ReviewTransferResult>(
                `/api/billing/admin/transfers/${item.id}/review`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    decision,
                    confirmedBankReference:
                      decision === "APROBADA"
                        ? String(values.get("confirmedBankReference") ?? "")
                        : undefined,
                    notes: String(values.get("notes") ?? "") || undefined,
                  }),
                },
              );
              toast.success(
                decision === "APROBADA"
                  ? "Pago conciliado y tenant activado."
                  : "Transferencia rechazada con trazabilidad.",
              );
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "No fue posible registrar la revisión.");
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Decisión financiera</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Una sola decisión, inmutable y ligada a tu usuario.</p>
            </div>
            <div className="flex rounded-xl border border-border bg-muted/40 p-1">
              <button type="button" onClick={() => setDecision("APROBADA")} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition", decision === "APROBADA" ? "bg-emerald-500 text-white" : "text-muted-foreground")}><Check className="h-3 w-3" />Aprobar</button>
              <button type="button" onClick={() => setDecision("RECHAZADA")} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition", decision === "RECHAZADA" ? "bg-danger text-white" : "text-muted-foreground")}><X className="h-3 w-3" />Rechazar</button>
            </div>
          </div>
          {decision === "APROBADA" ? (
            <div className="mt-4">
              <Label htmlFor="confirmedBankReference" className="text-xs text-muted-foreground">Referencia confirmada en el banco</Label>
              <Input id="confirmedBankReference" name="confirmedBankReference" required minLength={3} maxLength={160} placeholder="Referencia cotejada, no la declarada" className="mt-2 font-mono" disabled={pending} />
            </div>
          ) : null}
          <div className="mt-4">
            <Label htmlFor="notes" className="text-xs text-muted-foreground">Notas de conciliación <span className="font-normal">(opcional)</span></Label>
            <Textarea id="notes" name="notes" maxLength={1000} placeholder="Hallazgos, motivo de rechazo o contexto para auditoría..." className="mt-2 min-h-24" disabled={pending} />
          </div>
          <Button type="submit" variant={decision === "APROBADA" ? "primary" : "danger"} className="mt-4 w-full" disabled={pending || !item.evidence.length}>
            {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : decision === "APROBADA" ? <BadgeCheck className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
            {pending ? "Registrando revisión atómica..." : decision === "APROBADA" ? "Confirmar fondos y activar cliente" : "Rechazar transferencia"}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
          Esta solicitud ya no admite decisiones. Su historial financiero permanece inmutable.
        </div>
      )}
    </div>
  );
}

function RequestsView({
  queues,
  activeStatus,
  setActiveStatus,
  query,
  setQuery,
  selectedId,
  setSelectedId,
}: {
  queues: TransferQueues;
  activeStatus: TransferStatus;
  setActiveStatus: (status: TransferStatus) => void;
  query: string;
  setQuery: (value: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  const visibleItems = queues[activeStatus].filter((item) => {
    const needle = query.trim().toLowerCase();
    return (
      !needle ||
      [item.tenant.name, item.tenant.slug, item.invoice.number, item.payerName].some((value) =>
        value.toLowerCase().includes(needle),
      )
    );
  });
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold">Bandeja de solicitudes</p>
            <p className="mt-1 text-xs text-muted-foreground">Cada pestaña indica responsable, siguiente paso y decisión disponible.</p>
          </div>
          <div className="relative w-full xl:w-80">
            <Label htmlFor="platform-request-search" className="sr-only">Buscar solicitudes</Label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="platform-request-search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Cliente, factura u ordenante..." className="h-10 pl-10" />
          </div>
        </div>
        <div className="mt-4 flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={activeStatus === status}
              onClick={() => { setActiveStatus(status); setSelectedId(null); }}
              className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-xs transition", activeStatus === status ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {transferStatusLabels[status]} <span className="ml-1 opacity-55">{queues[status].length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-[680px] lg:grid-cols-[360px_1fr] xl:grid-cols-[410px_1fr]">
        <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-medium">{transferStatusLabels[activeStatus]}</p>
            <span className="text-[11px] text-muted-foreground">{visibleItems.length} registros</span>
          </div>
          <div className="space-y-2 lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
            {visibleItems.length ? (
              visibleItems.map((item) => (
                <QueueItem key={item.id} item={item} active={selected?.id === item.id} onClick={() => setSelectedId(item.id)} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <FileSearch className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-3 text-sm">Sin solicitudes en esta etapa</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {activeStatus === "EN_REVISION"
                    ? "No hay comprobantes esperando una decisión de AlphaBy."
                    : "Prueba otra etapa o limpia la búsqueda."}
                </p>
              </div>
            )}
          </div>
        </aside>
        <div className="p-4 sm:p-6">
          {selected ? (
            <ReviewPanel key={selected.id} item={selected} />
          ) : (
            <div className="grid min-h-[520px] place-items-center text-center">
              <div>
                <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">No hay una solicitud seleccionada</p>
                <p className="mt-2 text-xs text-muted-foreground">Elige otra etapa para consultar su historial.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ClientCard({
  client,
  onOpen,
}: {
  client: ObservedClient;
  onOpen: (client: ObservedClient) => void;
}) {
  const primaryStatus = primaryClientStatus(client);
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BillingStatusBadge status={primaryStatus} />
            <span className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">Tenant {client.tenantStatus}</span>
          </div>
          <h3 className="mt-3 truncate text-base font-semibold">{client.name}</h3>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{client.slug}</p>
        </div>
        <Button variant="secondary" className="h-9 shrink-0 px-3 text-xs" onClick={() => onOpen(client)}>
          Ver solicitudes <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Movimientos</p><p className="mt-2 text-sm font-semibold">{client.movements.length}</p></div>
        <div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Aprobado NIO</p><p className="mt-2 text-sm font-semibold">{formatBillingMoney(client.approvedTotals.NIO, "NIO")}</p></div>
        <div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Última actividad</p><p className="mt-2 text-xs font-medium">{formatBillingDate(client.latestMovement.createdAt)}</p></div>
      </div>
    </article>
  );
}

function ClientsView({
  clients,
  onOpen,
}: {
  clients: ObservedClient[];
  onOpen: (client: ObservedClient) => void;
}) {
  const [query, setQuery] = useState("");
  const visibleClients = clients.filter((client) => {
    const needle = query.trim().toLowerCase();
    return !needle || [client.name, client.slug, client.tenantStatus].some((value) => value.toLowerCase().includes(needle));
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Cartera observada</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Clientes con actividad financiera</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Vista consolidada a partir de solicitudes reales. La API todavía no expone un directorio global de tenants sin movimientos.</p>
        </div>
        <div className="relative w-full lg:w-80">
          <Label htmlFor="platform-client-search" className="sr-only">Buscar clientes</Label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="platform-client-search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Nombre, slug o estado..." className="pl-10" />
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {visibleClients.map((client) => <ClientCard key={client.id} client={client} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function PlansView({ plans }: { plans: BillingPlan[] }) {
  const groupedPlans = useMemo(() => {
    const groups = new Map<string, BillingPlan[]>();
    for (const plan of plans) groups.set(plan.code, [...(groups.get(plan.code) ?? []), plan]);
    return [...groups.values()].sort((left, right) => left[0].amountMinor - right[0].amountMinor);
  }, [plans]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Catálogo oficial</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Planes y entrega de acceso</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Estos precios llegan de <span className="font-mono text-foreground">GET /billing/plans</span>. Comparte el alta; el propietario elige moneda y plan antes de crear su empresa.</p>
        </div>
        <OnboardingActions />
      </div>

      {groupedPlans.length ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {groupedPlans.map((entries) => {
            const plan = entries[0];
            const enabledFeatures = Object.entries(plan.features).filter(([, enabled]) => enabled);
            return (
              <article key={plan.code} className={cn("rounded-3xl border bg-card p-6", plan.code === "BUSINESS" ? "border-foreground/25 shadow-xl shadow-foreground/5" : "border-border")}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{plan.code}</p><h3 className="mt-2 text-xl font-semibold">{plan.name}</h3></div>
                  {plan.code === "BUSINESS" ? <span className="rounded-full bg-foreground px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-background">Recomendado</span> : null}
                </div>
                <p className="mt-3 min-h-10 text-xs leading-5 text-muted-foreground">{plan.description ?? "Suscripción mensual para operar MultiLot 360."}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {entries.map((price) => <div key={price.id} className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">{price.currency} / mes</p><p className="mt-1 text-lg font-semibold tracking-tight">{formatBillingMoney(price.amountMinor, price.currency)}</p></div>)}
                </div>
                <div className="mt-5 border-t border-border pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Capacidad incluida</p>
                  <ul className="mt-3 space-y-2 text-xs">
                    {Object.entries(plan.limits).map(([limit, value]) => <li key={limit} className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{prettifyKey(limit)}</span><strong>{value}</strong></li>)}
                    {enabledFeatures.map(([feature]) => <li key={feature} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span>{prettifyKey(feature)}</span></li>)}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/7 p-8 text-center">
          <PackageCheck className="mx-auto h-7 w-7 text-amber-600" />
          <p className="mt-3 text-sm font-medium">El catálogo no está disponible</p>
          <p className="mt-1 text-xs text-muted-foreground">Verifica la API de desarrollo y vuelve a cargar esta página.</p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
        <strong className="text-foreground">Alcance actual:</strong> el Centro consulta y distribuye el catálogo oficial. Crear, editar o desactivar precios requiere endpoints administrativos que la API todavía no expone; por seguridad la interfaz no simula esas operaciones.
      </div>
    </section>
  );
}

function GuideView({ onViewRequests, onViewPlans }: { onViewRequests: () => void; onViewPlans: () => void }) {
  const useCases = [
    {
      title: "Dar acceso a un cliente nuevo",
      actor: "Comercial / AlphaBy",
      steps: ["Abrir Planes y acceso", "Compartir el enlace de alta", "El propietario crea empresa y cuenta", "Esperar documento y comprobante"],
      action: onViewPlans,
      actionLabel: "Ir a planes y acceso",
    },
    {
      title: "Aprobar una transferencia",
      actor: "Finanzas AlphaBy",
      steps: ["Abrir solicitudes En revisión", "Comparar evidencia con el banco", "Escribir referencia confirmada", "Aprobar para activar el tenant"],
      action: onViewRequests,
      actionLabel: "Abrir solicitudes",
    },
    {
      title: "Atender un comprobante rechazado",
      actor: "Cliente + soporte",
      steps: ["Consultar la decisión histórica", "Explicar la corrección al cliente", "El cliente declara nuevamente", "La nueva solicitud vuelve a En revisión"],
      action: onViewRequests,
      actionLabel: "Ver historial",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Manual dentro del producto</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Cómo trabaja una solicitud real</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">La solicitud no llega por correo ni se crea desde esta consola: nace en el portal aislado del cliente y aparece aquí cuando la API confirma que existe una declaración financiera.</p>
        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          {workflowSteps.map((step, index) => <article key={step.title} className="rounded-2xl border border-border bg-background p-4"><span className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-xs font-semibold text-background">0{index + 1}</span><h3 className="mt-4 text-sm font-medium">{step.title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{step.detail}</p><p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Responsable · {step.owner}</p></article>)}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {useCases.map((useCase) => <article key={useCase.title} className="flex flex-col rounded-3xl border border-border bg-card p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Caso de uso · {useCase.actor}</p><h3 className="mt-3 text-lg font-semibold">{useCase.title}</h3><ol className="mt-5 flex-1 space-y-3">{useCase.steps.map((step, index) => <li key={step} className="flex gap-3 text-xs leading-5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-semibold">{index + 1}</span><span>{step}</span></li>)}</ol><Button variant="secondary" className="mt-6 w-full text-xs" onClick={useCase.action}>{useCase.actionLabel}<ArrowRight className="ml-2 h-3.5 w-3.5" /></Button></article>)}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/7 p-5"><div className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Sí hace el Centro AlphaBy</div><ul className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground"><li>• Consultar precios oficiales y compartir el alta.</li><li>• Observar clientes presentes en el flujo financiero.</li><li>• Revisar evidencia privada con URL temporal.</li><li>• Aprobar o rechazar una sola vez con trazabilidad.</li></ul></article>
        <article className="rounded-2xl border border-amber-500/20 bg-amber-500/7 p-5"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-amber-600" />Requiere ampliar la API</div><ul className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground"><li>• Directorio completo de tenants y salud de suscripción.</li><li>• CRUD y versionado de planes/precios.</li><li>• Suspensión, reactivación o cambio de plan manual.</li><li>• Emisión fiscal y notas de crédito centralizadas.</li></ul></article>
      </div>
    </section>
  );
}

export function PlatformControlCenter({
  queues,
  plans,
}: {
  queues: TransferQueues;
  plans: BillingPlan[];
}) {
  const [view, setView] = useState<PlatformView>("overview");
  const [activeStatus, setActiveStatus] = useState<TransferStatus>(
    queues.EN_REVISION.length ? "EN_REVISION" : queues.PENDIENTE_EVIDENCIA.length ? "PENDIENTE_EVIDENCIA" : "APROBADA",
  );
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const allItems = useMemo(() => allTransferItems(queues), [queues]);
  const clients = useMemo(() => buildObservedClients(queues), [queues]);
  const approved = queues.APROBADA;
  const totals = approved.reduce(
    (accumulator, item) => ({
      ...accumulator,
      [item.currency]: accumulator[item.currency] + item.amountMinor,
    }),
    { USD: 0, NIO: 0 },
  );
  const attentionCount = queues.EN_REVISION.length + queues.PENDIENTE_EVIDENCIA.length;

  const openRequestsForClient = (client: ObservedClient) => {
    setQuery(client.slug);
    setActiveStatus(primaryClientStatus(client));
    setSelectedId(null);
    setView("requests");
  };

  return (
    <div className="mx-auto max-w-[1540px] space-y-5">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.11),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="h-3.5 w-3.5" />AlphaBy control plane</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl">Centro AlphaBy</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Opera altas, solicitudes, clientes observados y conciliación bancaria desde un flujo explícito. Cada dato proviene de los endpoints globales de facturación.</p>
          </div>
          <OnboardingActions />
        </div>
      </header>

      <ViewNavigation active={view} onChange={setView} requestCount={attentionCount} />

      {view === "overview" ? (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CountCard label="Clientes observados" value={String(clients.length)} detail="Tenants presentes en el flujo financiero real" icon={Building2} />
            <CountCard label="Requieren seguimiento" value={String(attentionCount)} detail={`${queues.EN_REVISION.length} decide AlphaBy · ${queues.PENDIENTE_EVIDENCIA.length} espera al cliente`} icon={Clock3} tone={attentionCount ? "amber" : undefined} />
            <CountCard label="Cobros aprobados USD" value={compactMoney(totals.USD, "USD")} detail={`${approved.filter((item) => item.currency === "USD").length} pagos confirmados`} icon={CircleDollarSign} tone="green" />
            <CountCard label="Cobros aprobados NIO" value={compactMoney(totals.NIO, "NIO")} detail={`${approved.filter((item) => item.currency === "NIO").length} pagos confirmados`} icon={BadgeCheck} tone="green" />
          </section>

          <section className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
            <article className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Qué necesita tu atención</p><h2 className="mt-2 text-xl font-semibold">Centro de trabajo de hoy</h2></div>
                <Button variant="secondary" className="h-9 px-3 text-xs" onClick={() => setView("requests")}>Abrir bandeja <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => { setActiveStatus("EN_REVISION"); setView("requests"); }} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:border-foreground/20"><p className="text-2xl font-semibold">{queues.EN_REVISION.length}</p><p className="mt-2 text-xs font-medium">Decisiones de AlphaBy</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Comprobante listo para cotejar con el banco.</p></button>
                <button type="button" onClick={() => { setActiveStatus("PENDIENTE_EVIDENCIA"); setView("requests"); }} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:border-foreground/20"><p className="text-2xl font-semibold">{queues.PENDIENTE_EVIDENCIA.length}</p><p className="mt-2 text-xs font-medium">Esperando al cliente</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Declaración creada sin evidencia adjunta.</p></button>
                <button type="button" onClick={() => { setActiveStatus("RECHAZADA"); setView("requests"); }} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:border-foreground/20"><p className="text-2xl font-semibold">{queues.RECHAZADA.length}</p><p className="mt-2 text-xs font-medium">Casos rechazados</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Historial para orientar una nueva declaración.</p></button>
              </div>
            </article>

            <article className="rounded-3xl border border-border bg-foreground p-6 text-background">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-60"><Workflow className="h-4 w-4" />Cómo llega una solicitud</div>
              <ol className="mt-5 space-y-4">
                {workflowSteps.map((step, index) => <li key={step.title} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background/10 text-[10px] font-semibold">{index + 1}</span><div><p className="text-sm font-medium">{step.title}</p><p className="mt-1 text-[11px] leading-5 opacity-60">{step.detail}</p></div></li>)}
              </ol>
              <button type="button" onClick={() => setView("guide")} className="mt-6 inline-flex items-center text-xs font-medium underline decoration-background/30 underline-offset-4">Ver casos de uso completos <ArrowRight className="ml-2 h-3.5 w-3.5" /></button>
            </article>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Actividad reciente</p><h2 className="mt-2 text-xl font-semibold">Últimas solicitudes</h2></div><button type="button" onClick={() => setView("clients")} className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground">Ver los {clients.length} clientes <ArrowRight className="ml-2 h-3.5 w-3.5" /></button></div>
            <div className="mt-5 grid gap-2 lg:grid-cols-3">
              {allItems.slice(0, 6).map((item) => <button key={item.id} type="button" onClick={() => { setActiveStatus(item.status); setQuery(item.tenant.slug); setSelectedId(item.id); setView("requests"); }} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:border-foreground/20"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><BillingStatusBadge status={item.status} /><p className="mt-3 truncate text-sm font-medium">{item.tenant.name}</p><p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{item.invoice.number}</p></div><p className="shrink-0 text-sm font-semibold">{formatBillingMoney(item.amountMinor, item.currency)}</p></div></button>)}
            </div>
          </section>
        </div>
      ) : null}

      {view === "requests" ? <RequestsView queues={queues} activeStatus={activeStatus} setActiveStatus={setActiveStatus} query={query} setQuery={setQuery} selectedId={selectedId} setSelectedId={setSelectedId} /> : null}
      {view === "clients" ? <ClientsView clients={clients} onOpen={openRequestsForClient} /> : null}
      {view === "plans" ? <PlansView plans={plans} /> : null}
      {view === "guide" ? <GuideView onViewRequests={() => setView("requests")} onViewPlans={() => setView("plans")} /> : null}

      <footer className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" />Acceso global separado del contexto operativo de cada tenant.</span><a href="https://dev-api.alphaby.cloud/docs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground hover:underline">Contrato API <ExternalLink className="h-3.5 w-3.5" /></a></footer>
    </div>
  );
}
