"use client";

import { useId } from "react";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { formatMiles } from "../utils/sales-formatters";

export function SaleCart() {
  const id = useId();
  const items = useSalesWorkspaceStore((state) => state.items);
  const updateItem = useSalesWorkspaceStore((state) => state.updateItem);
  const removeItem = useSalesWorkspaceStore((state) => state.removeItem);
  const clearDraft = useSalesWorkspaceStore((state) => state.clearDraft);
  const total = items.reduce((sum, item) => sum + (item.prizeMiles ?? 0), 0);

  return <section className="flex h-[clamp(360px,62vh,620px)] flex-col overflow-hidden rounded-2xl border border-border bg-card" aria-labelledby={`${id}-title`}><header className="flex items-center justify-between gap-3 border-b border-border p-4"><div><h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold text-foreground"><ShoppingCart className="h-4 w-4" />Ticket actual</h2><p className="mt-1 text-xs text-muted-foreground">{items.length} {items.length === 1 ? "número" : "números"}</p></div>{items.length ? <button type="button" onClick={clearDraft} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-danger"><Trash2 className="h-3.5 w-3.5" />Vaciar</button> : null}</header>
    <div className="flex-1 space-y-2 overflow-y-auto p-4">{items.length ? items.map((item) => <article key={item.number} className={`grid grid-cols-[44px_1fr_36px] items-center gap-3 rounded-xl border bg-background p-2 ${item.prizeMiles === null ? "border-amber-500/40" : "border-border"}`}><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-mono font-semibold text-primary-foreground">{item.number}</span><div><label htmlFor={`${id}-amount-${item.number}`} className="sr-only">Monto del número {item.number}</label><Input id={`${id}-amount-${item.number}`} type="number" inputMode="decimal" min={1} max={999999} step={1} placeholder="Monto" value={item.prizeMiles ?? ""} onChange={(event) => updateItem(item.number, event.target.value === "" ? null : Math.max(1, Math.min(999_999, Number(event.target.value))))} className="h-10 font-mono" /></div><button type="button" aria-label={`Quitar número ${item.number}`} onClick={() => removeItem(item.number)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-danger/10 hover:text-danger"><X className="h-4 w-4" /></button></article>) : <div className="grid h-full min-h-[240px] place-items-center text-center"><div><ShoppingCart className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium text-foreground">Ticket vacío</p><p className="mt-1 text-xs text-muted-foreground">Agrega la primera jugada para comenzar.</p></div></div>}</div>
    <footer className="border-t border-border bg-muted/30 p-4"><div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Premio total</p><p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">{formatMiles(total)} <span className="text-xs font-normal text-muted-foreground">miles</span></p></div><span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">Máx. 100</span></div></footer>
  </section>;
}
