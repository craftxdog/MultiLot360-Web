import { routes } from "@/config/routes";

export type NavigationIcon =
  | "banknote"
  | "ban"
  | "bar-chart"
  | "calendar-clock"
  | "clipboard-check"
  | "gauge"
  | "landmark"
  | "list-checks"
  | "lock-keyhole"
  | "receipt-text"
  | "settings"
  | "shield-check"
  | "sliders"
  | "ticket"
  | "trophy"
  | "users";

export type NavigationItem = {
  title: string;
  href: string;
  icon: NavigationIcon;
  permission?: string;
  anyPermissions?: readonly string[];
  badge?: string;
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    title: "Operación",
    items: [
      {
        title: "Dashboard",
        href: routes.dashboard,
        icon: "gauge",
      },
      {
        title: "Ventas",
        href: routes.sales,
        icon: "ticket",
        anyPermissions: ["ventas.read", "ventas.create"],
      },
      {
        title: "Matriz de ventas",
        href: routes.salesMatrix,
        icon: "list-checks",
        permission: "matriz_ventas.read",
      },
      {
        title: "Turnos",
        href: routes.shifts,
        icon: "calendar-clock",
        anyPermissions: ["turnos.read", "sorteos.read"],
      },
      {
        title: "Resultados",
        href: routes.results,
        icon: "trophy",
        permission: "resultados.read",
      },
    ],
  },
  {
    title: "Control",
    items: [
      {
        title: "Premios",
        href: routes.prizePayments,
        icon: "banknote",
        permission: "pagos_premios.read",
      },
      {
        title: "Cortes",
        href: routes.cashCuts,
        icon: "receipt-text",
        permission: "cortes.read",
      },
      {
        title: "Control numérico",
        href: routes.numberControl,
        icon: "sliders",
        anyPermissions: ["numeros_bloqueados.read", "limites_numero.read"],
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        title: "Reportes",
        href: routes.reports,
        icon: "bar-chart",
        permission: "ventas.read",
      },
      {
        title: "Vendedores",
        href: routes.sellers,
        icon: "users",
        anyPermissions: ["vendedores.read", "usuarios.read"],
      },
      {
        title: "Parámetros",
        href: routes.parameters,
        icon: "settings",
        permission: "parametros.read",
      },
      {
        title: "Roles y permisos",
        href: routes.roles,
        icon: "shield-check",
        permission: "roles.read",
      },
      {
        title: "Auditoría",
        href: routes.audit,
        icon: "clipboard-check",
        permission: "auditoria.read",
      },
    ],
  },
];

export const quickActions: NavigationItem[] = [
  {
    title: "Nueva venta",
    href: `${routes.sales}?view=sell`,
    icon: "landmark",
    permission: "ventas.create",
  },
  {
    title: "Bloquear número",
    href: `${routes.numberControl}?view=blocked`,
    icon: "lock-keyhole",
    permission: "numeros_bloqueados.create",
  },
  {
    title: "Registrar resultado",
    href: routes.results,
    icon: "shield-check",
    permission: "resultados.create",
  },
];
