"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Gauge, SlidersHorizontal, TicketCheck, Trophy } from "lucide-react";
import { navigationGroups, quickActions } from "@/config/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { drawOverviewQueryOptions } from "@/features/draws/queries/draw.queries";
import { numberControlOverviewQueryOptions } from "@/features/number-control/queries/number-control.queries";
import { resultsOptions } from "@/features/operations/queries/operations.queries";
import { salesOverviewQueryOptions } from "@/features/sales/queries/sales.queries";
import { canAccessItem, filterItemsByPermissions } from "@/lib/auth/permissions";
import { DashboardCharts } from "./dashboard-charts";

function MetricCard({ label, value, detail, icon: Icon, loading }: { label: string; value: string; detail: string; icon: typeof Gauge; loading?: boolean }) {
  return <article className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-4 w-4 text-muted-foreground" /></div><p className={`mt-5 text-3xl font-semibold tracking-tighter ${loading ? "animate-pulse text-muted-foreground" : "text-card-foreground"}`}>{loading ? "—" : value}</p><p className="mt-4 text-sm text-muted-foreground">{detail}</p></article>;
}

export function DashboardWorkspace() {
  const { data: user } = useCurrentUser();
  const canReadSales = user?.permissions.includes("ventas.read") ?? false;
  const canReadDraws = Boolean(user?.permissions.includes("turnos.read") && user.permissions.includes("sorteos.read"));
  const canReadNumberControl = Boolean(user?.permissions.includes("limites_numero.read") && user.permissions.includes("numeros_bloqueados.read"));
  const canReadResults = user?.permissions.includes("resultados.read") ?? false;
  const isAdmin = user?.role.name.toUpperCase() === "ADMIN";
  const sales = useQuery({ ...salesOverviewQueryOptions(), enabled: canReadSales });
  const draws = useQuery({ ...drawOverviewQueryOptions(), enabled: canReadDraws });
  const controls = useQuery({ ...numberControlOverviewQueryOptions(), enabled: canReadNumberControl });
  const results = useQuery({ ...resultsOptions({ page: 1, limit: 1 }), enabled: canReadResults });
  const actions = user ? filterItemsByPermissions(user, quickActions) : [];
  const destinations = user ? navigationGroups.flatMap((group) => group.items).filter((item) => item.href !== "/dashboard" && canAccessItem(user, item)).slice(0, 6) : [];

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="border-b border-border pb-6"><div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><Gauge className="h-3.5 w-3.5" />Resumen en vivo</div><h1 className="mt-3 text-3xl font-semibold tracking-tighter text-foreground">Hola, {user?.name ?? user?.seller?.name ?? user?.username ?? "usuario"}</h1><p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">Los indicadores se calculan desde los endpoints protegidos que tu sesión puede consultar; no hay valores de demostración.</p></header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores operativos">
      {canReadSales ? <MetricCard label="Ventas de hoy" value={String(sales.data?.today ?? 0)} detail={`${sales.data?.active ?? 0} activas · ${sales.data?.voided ?? 0} anuladas`} icon={TicketCheck} loading={sales.isLoading} /> : null}
      {canReadDraws ? <MetricCard label="Turnos abiertos" value={String(draws.data?.open ?? 0)} detail={`${draws.data?.blocked ?? 0} bloqueados · ${draws.data?.closed ?? 0} cerrados`} icon={CalendarClock} loading={draws.isLoading} /> : null}
      {canReadNumberControl ? <MetricCard label="Límites activos" value={String(controls.data?.activeLimits ?? 0)} detail={`${controls.data?.blockedNumbers ?? 0} números bloqueados`} icon={SlidersHorizontal} loading={controls.isLoading} /> : null}
      {canReadResults ? <MetricCard label="Resultados" value={String(results.data?.pagination.total ?? 0)} detail="Resultados registrados en la API" icon={Trophy} loading={results.isLoading} /> : null}
    </section>

    {canReadSales ? <DashboardCharts admin={isAdmin} sellerId={user?.seller?.id} /> : null}

    {actions.length ? <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-sm font-medium">Acciones rápidas</h2><div className="mt-4 flex flex-wrap gap-2">{actions.map((action) => <Link key={action.href} href={action.href} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm transition hover:bg-accent">{action.title}<ArrowRight className="h-3.5 w-3.5" /></Link>)}</div></section> : null}

    <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-sm font-medium">Módulos disponibles</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{destinations.map((item) => <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-xl border border-border p-4 text-sm transition hover:bg-accent"><span>{item.title}</span><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>)}</div></section>
  </div>;
}
