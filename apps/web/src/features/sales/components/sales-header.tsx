"use client";

import { Settings2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";

export function SalesHeader({ isAdmin, canUpdate }: { isAdmin: boolean; canUpdate: boolean }) {
  const openPolicy = useSalesWorkspaceStore((state) => state.openPolicy);
  return <header className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"><ShoppingBag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />Estación operativa</div><h1 className="text-2xl font-semibold tracking-tight text-foreground">Ventas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Registra tickets con varios números, consulta movimientos y gestiona anulaciones sin abandonar el flujo de venta.</p></div>{isAdmin && canUpdate ? <Button variant="secondary" className="gap-2" onClick={openPolicy}><Settings2 className="h-4 w-4" />Política de anulación</Button> : null}</header>;
}
