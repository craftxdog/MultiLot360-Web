"use client";

import { Search, UserCheck, UserX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { useSellerDirectory } from "../hooks/use-sellers";
import type { SellerDirectoryQuery } from "../types/seller.types";

export function SellerDirectory({ query }: { query: SellerDirectoryQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const directory = useSellerDirectory(query);
  const update = (changes: SellerDirectoryQuery) => { const params = new URLSearchParams(); params.set("view", "directory"); const next = { ...query, ...changes }; Object.entries(next).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); }); router.replace(`${pathname}?${params}`); };
  const pagination = directory.data?.pagination ?? { page: query.page ?? 1, limit: query.limit ?? 10, count: 0, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false };

  return <>
    <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); update({ search: String(data.get("search") ?? "").trim() || undefined, active: data.get("active") === "all" ? undefined : data.get("active") === "true", page: 1 }); }}>
      <Input name="search" defaultValue={query.search} placeholder="Nombre, usuario o documento" aria-label="Buscar vendedor" />
      <select name="active" defaultValue={query.active === undefined ? "all" : String(query.active)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="all">Todos los estados</option><option value="true">Activos</option><option value="false">Inactivos</option></select>
      <Button type="submit" variant="secondary" className="h-11 gap-2"><Search className="h-4 w-4" />Buscar</Button>
    </form>
    {directory.error ? <p role="alert" className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{directory.error.message}</p> : null}
    <div className={`mt-4 overflow-x-auto transition-opacity ${directory.isFetching ? "opacity-60" : ""}`}><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="px-3 py-3 font-medium">Vendedor</th><th className="px-3 py-3 font-medium">Usuario</th><th className="px-3 py-3 font-medium">Rol</th><th className="px-3 py-3 font-medium">Documento</th><th className="px-3 py-3 font-medium">Estado</th></tr></thead><tbody>{directory.data?.sellers.map((seller) => <tr key={seller.id} className="border-b border-border last:border-0"><td className="px-3 py-3"><span className="font-medium">{seller.name}</span><span className="block text-xs text-muted-foreground">{seller.phone ?? "Sin teléfono"}</span></td><td className="px-3 py-3">{seller.username}</td><td className="px-3 py-3">{seller.roleName}</td><td className="px-3 py-3 font-mono text-xs">{seller.documentId}</td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${seller.active && seller.userActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{seller.active && seller.userActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}{seller.active && seller.userActive ? "Activo" : "Inactivo"}</span></td></tr>)}</tbody></table></div>
    {!directory.isFetching && !directory.data?.sellers.length ? <p className="py-10 text-center text-sm text-muted-foreground">No hay vendedores con estos filtros.</p> : null}
    <DataPagination basePath="/vendedores" params={{ view: "directory", search: query.search, active: query.active }} pagination={pagination} itemLabel="vendedores" />
  </>;
}
