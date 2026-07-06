"use client";

import { AlertCircle, ChevronUp, ShoppingCart, TicketCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { formatMiles } from "../utils/sales-formatters";
import { SaleCart } from "./sale-cart";
import { SalesDrawer } from "./sales-drawer";

type MobileSaleTicketProps = {
  canSubmit: boolean;
  error: Error | null;
  onSubmit: () => void;
  pending: boolean;
};

export function MobileSaleTicket({ canSubmit, error, onSubmit, pending }: MobileSaleTicketProps) {
  const items = useSalesWorkspaceStore((state) => state.items);
  const open = useSalesWorkspaceStore((state) => state.cartDrawerOpen);
  const openCart = useSalesWorkspaceStore((state) => state.openCart);
  const closeCart = useSalesWorkspaceStore((state) => state.closeCart);
  const total = items.reduce((sum, item) => sum + (item.prizeMiles ?? 0), 0);
  const hasMissingAmounts = items.some((item) => item.prizeMiles === null);

  return <>
    <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 xl:hidden">
      <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border bg-card/95 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl ${error ? "border-danger/40" : "border-border"}`}>
        <button type="button" onClick={openCart} className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 text-left outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {error || hasMissingAmounts ? <AlertCircle className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {items.length ? <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-card bg-amber-500 px-1 text-[10px] font-semibold text-black">{items.length}</span> : null}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-xs font-medium text-foreground">{hasMissingAmounts ? "Completa los montos" : "Ticket actual"} <ChevronUp className="h-3 w-3 text-muted-foreground" /></span>
            <span className="block truncate font-mono text-sm font-semibold tabular-nums text-foreground">{formatMiles(total)} <span className="text-[10px] font-normal text-muted-foreground">miles</span></span>
          </span>
        </button>
        <Button className="h-12 gap-2 rounded-xl px-4" disabled={!canSubmit} onClick={onSubmit}>
          <TicketCheck className="h-4 w-4" />
          <span className="hidden min-[390px]:inline">{pending ? "Registrando…" : "Registrar"}</span>
        </Button>
      </div>
    </div>

    <SalesDrawer open={open} onClose={closeCart} title="Ticket actual" description={`${items.length} ${items.length === 1 ? "número preparado" : "números preparados"} para esta venta`}>
      <div className="space-y-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <SaleCart />
        {hasMissingAmounts ? <div role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">Hay números sin monto. Complétalos para habilitar la venta.</div> : null}
        {error ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">{error.message}<p className="mt-1 text-xs opacity-80">El ticket se conservó para que puedas corregirlo.</p></div> : null}
        <Button className="h-14 w-full gap-2 text-base" disabled={!canSubmit} onClick={onSubmit}><TicketCheck className="h-5 w-5" />{pending ? "Validando y registrando…" : "Registrar ticket completo"}</Button>
      </div>
    </SalesDrawer>
  </>;
}
