"use client";

import { Search, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { ParametersQuery } from "../types/parameter.types";

type SortValue = "key:asc" | "key:desc" | "updatedAt:desc" | "updatedAt:asc";

export function ParameterToolbar({ query }: { query: ParametersQuery }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const changed = useRef(false);
  const [key, setKey] = useState(query.key ?? "");
  const sort = `${query.sortBy ?? "key"}:${query.sortDirection ?? "asc"}` as SortValue;

  useEffect(() => {
    if (!changed.current) return;

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const cleanKey = key.trim();

      if (cleanKey) params.set("key", cleanKey);
      else params.delete("key");
      params.delete("page");
      changed.current = false;

      const next = params.toString();
      window.history.replaceState(
        null,
        "",
        next ? `${pathname}?${next}` : pathname,
      );
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [key, pathname, searchParams]);

  const changeSort = (value: SortValue) => {
    const [sortBy, sortDirection] = value.split(":") as [
      "key" | "updatedAt",
      "asc" | "desc",
    ];
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);
    params.delete("page");
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  const clear = () => {
    setKey("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("key");
    params.delete("page");
    const next = params.toString();
    window.history.replaceState(null, "", next ? `${pathname}?${next}` : pathname);
  };

  return (
    <div className="grid gap-3 border-b border-border pb-4 sm:grid-cols-[minmax(240px,1fr)_220px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={key}
          onChange={(event) => {
            changed.current = true;
            setKey(event.target.value);
          }}
          aria-label="Buscar parámetro por clave"
          placeholder="Buscar clave, por ejemplo sales."
          className="h-10 rounded-lg pl-9 pr-3"
        />
      </div>
      <select
        value={sort}
        onChange={(event) => changeSort(event.target.value as SortValue)}
        aria-label="Ordenar parámetros"
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-foreground/25"
      >
        <option value="key:asc">Clave A–Z</option>
        <option value="key:desc">Clave Z–A</option>
        <option value="updatedAt:desc">Cambio más reciente</option>
        <option value="updatedAt:asc">Cambio más antiguo</option>
      </select>
      <button
        type="button"
        onClick={clear}
        disabled={!key}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <X className="h-4 w-4" />
        Limpiar
      </button>
    </div>
  );
}
