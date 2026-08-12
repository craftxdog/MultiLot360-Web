"use client";

import { usePathname } from "next/navigation";
import { Building2, Wifi, WifiOff } from "lucide-react";
import type { NavigationGroup } from "@/config/navigation";
import { routes } from "@/config/routes";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useRealtimeStatus } from "@/features/realtime/components/realtime-provider";
import { MobileNavigation } from "./mobile-navigation";
import { UserMenu } from "./user-menu";
import { NotificationMenu } from "@/features/notifications/components/notification-menu";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

type AppTopbarProps = {
  groups: NavigationGroup[];
  pageTitle?: string;
};

const pageTitles: Record<string, string> = {
  [routes.dashboard]: "Dashboard",
  [routes.sales]: "Ventas",
  [routes.salesMatrix]: "Matriz de ventas",
  [routes.draws]: "Turnos",
  [routes.shifts]: "Turnos",
  [routes.numberControl]: "Control numérico",
  [routes.blockedNumbers]: "Números bloqueados",
  [routes.numberLimits]: "Límites",
  [routes.results]: "Resultados",
  [routes.prizePayments]: "Premios",
  [routes.cashCuts]: "Cortes",
  [routes.reports]: "Reportes",
  [routes.sellers]: "Vendedores",
  [routes.users]: "Usuarios",
  [routes.parameters]: "Parámetros",
  [routes.roles]: "Roles y permisos",
  [routes.audit]: "Auditoría",
  [routes.subscription]: "Suscripción",
  [routes.platform]: "Centro AlphaBy",
};

function getPageTitle(pathname: string) {
  const match = Object.entries(pageTitles)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => pathname.startsWith(href));
  return match?.[1] ?? "MultiLot 360";
}

export function AppTopbar({ groups, pageTitle }: AppTopbarProps) {
  const pathname = usePathname();
  const title = pageTitle ?? getPageTitle(pathname);
  const realtime = useRealtimeStatus();
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation groups={groups} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-[-0.02em] text-foreground">{title}</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{user?.tenant ? `${user.tenant.name} · contexto aislado` : "Operación protegida por permisos y módulos"}</p>
        </div>
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        {user?.tenant ? <div title={`Tenant: ${user.tenant.slug}`} className="hidden h-9 max-w-48 items-center gap-2 rounded-lg border border-border px-2.5 text-[11px] text-muted-foreground xl:flex"><Building2 className="h-3.5 w-3.5" /><span className="truncate">{user.tenant.slug}</span></div> : null}
        <div title={realtime.status === "connected" ? "Actualización en tiempo real activa" : "Reconectando tiempo real"} className="hidden h-9 items-center gap-2 rounded-lg border border-border px-2.5 text-[11px] text-muted-foreground sm:flex">
          {realtime.status === "connected" ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5 text-amber-500" />}
          {realtime.status === "connected" ? "En vivo" : "Reconectando"}
        </div>
        <NotificationMenu />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
