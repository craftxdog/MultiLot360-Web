"use client";

import { Search, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SellerInvitationsQuery } from "../types/seller.types";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SellerInvitationsFilters({
  query,
}: {
  query: SellerInvitationsQuery;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const changed = useRef(false);
  const [sellerName, setSellerName] = useState(query.sellerName ?? "");
  const [username, setUsername] = useState(query.username ?? "");
  const [email, setEmail] = useState(query.email ?? "");
  const [status, setStatus] = useState(query.status ?? "");

  useEffect(() => {
    if (!changed.current) return;

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const cleanName = sellerName.trim();
      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      if (cleanName) params.set("sellerName", cleanName);
      else params.delete("sellerName");

      if (cleanUsername) params.set("username", cleanUsername);
      else params.delete("username");

      if (cleanEmail && isValidEmail(cleanEmail)) params.set("email", cleanEmail);
      else params.delete("email");

      if (status) params.set("status", status);
      else params.delete("status");
      params.delete("page");
      changed.current = false;

      const next = params.toString();
      window.history.replaceState(
        null,
        "",
        next ? `${pathname}?${next}` : pathname,
      );
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [email, pathname, searchParams, sellerName, status, username]);

  const markChanged = () => {
    changed.current = true;
  };

  const clear = () => {
    setSellerName("");
    setUsername("");
    setEmail("");
    setStatus("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sellerName");
    params.delete("username");
    params.delete("email");
    params.delete("status");
    params.delete("page");
    const next = params.toString();
    window.history.replaceState(
      null,
      "",
      next ? `${pathname}?${next}` : pathname,
    );
  };

  const partialEmail = email.trim().length > 0 && !isValidEmail(email.trim());
  const hasFilters = Boolean(sellerName || username || email || status);

  return (
    <div className="border-b border-border pb-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_240px_170px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={sellerName}
            onChange={(event) => { markChanged(); setSellerName(event.target.value); }}
            placeholder="Buscar vendedor..."
            aria-label="Buscar vendedor por nombre"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-foreground/25"
          />
        </div>
        <input
          value={username}
          onChange={(event) => { markChanged(); setUsername(event.target.value); }}
          placeholder="Usuario"
          aria-label="Buscar por nombre de usuario"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-foreground/25"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => { markChanged(); setEmail(event.target.value); }}
          placeholder="Correo completo"
          aria-label="Filtrar por correo"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-foreground/25"
        />
        <select
          value={status}
          onChange={(event) => { markChanged(); setStatus(event.target.value); }}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-foreground/25"
          aria-label="Filtrar por estado de acceso"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="USADO">Activadas</option>
          <option value="EXPIRADO">Expiradas</option>
          <option value="REVOCADO">Revocadas</option>
        </select>
        <button
          type="button"
          onClick={clear}
          disabled={!hasFilters}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <X className="h-4 w-4" /> Limpiar
        </button>
      </div>
      <div className="mt-2 min-h-5 text-xs text-muted-foreground">
        {partialEmail ? "Escribe el correo completo para aplicar ese filtro." : null}
      </div>
    </div>
  );
}
