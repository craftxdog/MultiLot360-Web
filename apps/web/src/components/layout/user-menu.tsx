"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

function initials(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function UserMenu() {
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name ?? user?.seller?.name ?? user?.username ?? "Usuario";

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg border border-border p-1.5 pr-2 text-left transition hover:bg-accent"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{initials(displayName)}</span>
        <span className="hidden max-w-28 truncate text-xs text-foreground sm:block">{displayName}</span>
        <ChevronDown className={`hidden h-3.5 w-3.5 text-muted-foreground transition sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div role="menu" className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{initials(displayName)}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">@{user?.username ?? "usuario"}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1"><ShieldCheck className="h-3 w-3" />{user?.role.name ?? "Usuario"}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" />{user?.active === false ? "Inactivo" : "Activo"}</span>
            </div>
            {user?.seller ? <p className="mt-3 text-xs text-muted-foreground">Vendedor: {user.seller.name ?? user.seller.id}</p> : <p className="mt-3 text-xs text-muted-foreground">{user?.modules.length ?? 0} módulos · {user?.permissions.length ?? 0} permisos</p>}
          </div>
          <div className="p-2">
            {user && ["vendedores.read", "usuarios.read"].some((permission) => user.permissions.includes(permission)) ? <Link role="menuitem" href={routes.sellers} onClick={() => setOpen(false)} className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Users className="h-4 w-4" />Vendedores y accesos</Link> : null}
            {user?.permissions.includes("parametros.read") ? <Link role="menuitem" href={routes.parameters} onClick={() => setOpen(false)} className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Settings className="h-4 w-4" />Parámetros</Link> : null}
            <form action={logoutAction}>
              <button role="menuitem" type="submit" className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-danger hover:bg-danger/10"><LogOut className="h-4 w-4" />Cerrar sesión</button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
