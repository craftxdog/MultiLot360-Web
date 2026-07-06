"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSalesMutations } from "../hooks/use-sales-mutations";
import { voidSaleSchema } from "../schemas/sales.schema";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";

export function VoidSaleDialogContent({ saleId }: { saleId: string }) {
  const clear = useSalesWorkspaceStore((state) => state.clearVoid);
  const { voidSale } = useSalesMutations();
  const [reason, setReason] = React.useState("");
  const parsed = voidSaleSchema.safeParse({ reason });
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && clear();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [clear]);
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && clear()}><section role="alertdialog" aria-modal="true" aria-labelledby="void-title" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300"><AlertTriangle className="h-5 w-5" /></span><h2 id="void-title" className="mt-4 text-lg font-semibold text-foreground">Anular venta</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">La venta saldrá del acumulado. El backend comprobará que el turno siga abierto y que la ventana permitida no haya vencido.</p><div className="mt-5"><Label htmlFor="voidReason">Motivo</Label><textarea id="voidReason" autoFocus rows={3} maxLength={250} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8" placeholder="Ej. el cliente solicitó cancelar el ticket" /></div><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={clear}>Conservar venta</Button><Button variant="danger" disabled={!parsed.success || voidSale.isPending} onClick={async () => { if (!parsed.success) return; try { await voidSale.mutateAsync({ saleId, reason: parsed.data.reason }); clear(); } catch {} }}>{voidSale.isPending ? "Anulando…" : "Confirmar anulación"}</Button></div></section></div>;
}
