"use client";

import { AlertTriangle, Search, Trash2, UserCheck, UserMinus, UserX } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useSellerMutations } from "../hooks/use-seller-mutations";
import { useSellerDirectory } from "../hooks/use-sellers";
import type { SellerDirectoryItem, SellerDirectoryQuery } from "../types/seller.types";

type PendingSellerAction = {
  type: "deactivate" | "delete";
  seller: SellerDirectoryItem;
} | null;

export function SellerDirectory({ query }: { query: SellerDirectoryQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: currentUser } = useCurrentUser();
  const { deactivateSeller, deleteSeller } = useSellerMutations();
  const [pendingAction, setPendingAction] = useState<PendingSellerAction>(null);
  const [reason, setReason] = useState("");
  const directory = useSellerDirectory(query);
  const canDeactivate = currentUser?.permissions.includes("usuarios.delete") ?? false;
  const canDelete = currentUser?.permissions.includes("usuarios.delete") ?? false;
  const mutating = deactivateSeller.isPending || deleteSeller.isPending;
  const update = (changes: SellerDirectoryQuery) => { const params = new URLSearchParams(); params.set("view", "directory"); const next = { ...query, ...changes }; Object.entries(next).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); }); router.replace(`${pathname}?${params}`); };
  const pagination = directory.data?.pagination ?? { page: query.page ?? 1, limit: query.limit ?? 10, count: 0, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      const input = { sellerId: pendingAction.seller.id, reason: reason.trim() || undefined };
      if (pendingAction.type === "deactivate") await deactivateSeller.mutateAsync(input);
      else await deleteSeller.mutateAsync(input);
      setPendingAction(null);
      setReason("");
    } catch {}
  };
  const openAction = (action: NonNullable<PendingSellerAction>) => {
    setReason("");
    setPendingAction(action);
  };

  return <>
    <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); update({ search: String(data.get("search") ?? "").trim() || undefined, active: data.get("active") === "all" ? undefined : data.get("active") === "true", page: 1 }); }}>
      <Input name="search" defaultValue={query.search} placeholder="Nombre, usuario o documento" aria-label="Buscar vendedor" />
      <select name="active" defaultValue={query.active === undefined ? "all" : String(query.active)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="all">Todos los estados</option><option value="true">Activos</option><option value="false">Inactivos</option></select>
      <Button type="submit" variant="secondary" className="h-11 gap-2"><Search className="h-4 w-4" />Buscar</Button>
    </form>
    {directory.error ? <p role="alert" className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{directory.error.message}</p> : null}
    <div className={`mt-4 overflow-x-auto transition-opacity ${directory.isFetching ? "opacity-60" : ""}`}><table className="w-full min-w-[860px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="px-3 py-3 font-medium">Vendedor</th><th className="px-3 py-3 font-medium">Usuario</th><th className="px-3 py-3 font-medium">Rol</th><th className="px-3 py-3 font-medium">Documento</th><th className="px-3 py-3 font-medium">Estado</th>{canDeactivate || canDelete ? <th className="px-3 py-3 text-right font-medium">Acciones</th> : null}</tr></thead><tbody>{directory.data?.sellers.map((seller) => <tr key={seller.id} className="border-b border-border last:border-0"><td className="px-3 py-3"><span className="font-medium">{seller.name}</span><span className="block text-xs text-muted-foreground">{seller.phone ?? "Sin teléfono"}</span></td><td className="px-3 py-3">{seller.username}</td><td className="px-3 py-3">{seller.roleName}</td><td className="px-3 py-3 font-mono text-xs">{seller.documentId}</td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${seller.active && seller.userActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{seller.active && seller.userActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}{seller.active && seller.userActive ? "Activo" : "Inactivo"}</span>{seller.deletionReason ? <span className="mt-1 block max-w-[220px] truncate text-[11px] text-muted-foreground">{seller.deletionReason}</span> : null}</td>{canDeactivate || canDelete ? <td className="px-3 py-3"><div className="flex justify-end gap-2">{canDeactivate && (seller.active || seller.userActive) ? <button type="button" onClick={() => openAction({ type: "deactivate", seller })} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/25 px-3 text-xs text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-300"><UserMinus className="h-3.5 w-3.5" />Desactivar</button> : null}{canDelete ? <button type="button" onClick={() => openAction({ type: "delete", seller })} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/25 px-3 text-xs text-danger transition hover:bg-danger/10"><Trash2 className="h-3.5 w-3.5" />Eliminar</button> : null}</div></td> : null}</tr>)}</tbody></table></div>
    {!directory.isFetching && !directory.data?.sellers.length ? <p className="py-10 text-center text-sm text-muted-foreground">No hay vendedores con estos filtros.</p> : null}
    <DataPagination basePath="/vendedores" params={{ view: "directory", search: query.search, active: query.active }} pagination={pagination} itemLabel="vendedores" />
    {pendingAction ? <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !mutating && setPendingAction(null)}><section role="alertdialog" aria-modal="true" aria-labelledby="seller-action-title" className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${pendingAction.type === "delete" ? "bg-danger/10 text-danger" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}><AlertTriangle className="h-5 w-5" /></span><h2 id="seller-action-title" className="mt-4 text-lg font-semibold text-foreground">{pendingAction.type === "delete" ? "Eliminar vendedor definitivamente" : "Desactivar vendedor"}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{pendingAction.type === "delete" ? `Esta acción eliminará por completo a ${pendingAction.seller.name}: Auth, ventas, pagos, límites y perfil. Confírmalo sólo si realmente quieres una eliminación física.` : `${pendingAction.seller.name} dejará de poder operar, pero su historial y auditoría se conservarán.`}</p><div className="mt-4 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground"><p className="font-medium text-foreground">{pendingAction.seller.name}</p><p>@{pendingAction.seller.username} · {pendingAction.seller.documentId}</p></div><label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="seller-delete-reason">Motivo para auditoría</label><textarea id="seller-delete-reason" value={reason} onChange={(event) => setReason(event.target.value.slice(0, 300))} placeholder="Ej. Solicitud administrativa por duplicado o baja definitiva." className="mt-2 min-h-24 w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8" /><p className="mt-1 text-right text-[11px] text-muted-foreground">{reason.length}/300</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setPendingAction(null)} disabled={mutating}>Cancelar</Button><Button variant={pendingAction.type === "delete" ? "danger" : "secondary"} onClick={confirmAction} disabled={mutating}>{mutating ? "Procesando…" : pendingAction.type === "delete" ? "Sí, eliminar completo" : "Sí, soft delete"}</Button></div></section></div> : null}
  </>;
}
