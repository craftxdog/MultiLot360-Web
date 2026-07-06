"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Command,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { routes } from "@/config/routes";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useRealtimeStatus } from "@/features/realtime/components/realtime-provider";

type AppTopbarProps = {
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
  [routes.audit]: "Auditoría",
  [routes.settings]: "Ajustes",
};

function getPageTitle(pathname: string) {
  const match = Object.entries(pageTitles)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => pathname.startsWith(href));

  return match?.[1] ?? "MultiLot 360";
}

export function AppTopbar({ pageTitle }: AppTopbarProps) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const title = pageTitle ?? getPageTitle(pathname);
  const realtime = useRealtimeStatus();

  return (
    <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Abrir navegación"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-[-0.02em] text-foreground">
            {title}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            Operación protegida por permisos y módulos
          </p>
        </div>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <div
          title={realtime.status === "connected" ? "Actualización en tiempo real activa" : "Reconectando tiempo real"}
          className="hidden h-9 items-center gap-2 rounded-lg border border-border px-2.5 text-[11px] text-muted-foreground sm:flex"
        >
          {realtime.status === "connected" ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5 text-amber-500" />}
          {realtime.status === "connected" ? "En vivo" : "Reconectando"}
        </div>
        <button
          type="button"
          className="hidden h-9 w-45 items-center gap-2 rounded-lg border border-border bg-accent px-3 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground xl:flex 2xl:w-60"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Buscar...</span>
          <span className="ml-auto hidden items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground 2xl:flex">
            <Command className="h-3 w-3" /> K
          </span>
        </button>

        <ThemeToggle />

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
        </button>

        <Link
          href={routes.settings}
          className="hidden h-9 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground lg:flex"
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="max-w-22.5 truncate">
            {user?.role.name ?? "Usuario"}
          </span>
        </Link>

        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
