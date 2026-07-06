"use client";

import { Ban, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNumberControlStore } from "../store/number-control.store";

export function NumberControlHeader({ canCreateLimit, canCreateBlock }: { canCreateLimit: boolean; canCreateBlock: boolean }) {
  const openCreateLimit = useNumberControlStore((state) => state.openCreateLimit);
  const openCreateBlock = useNumberControlStore((state) => state.openCreateBlock);

  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Centro de protección
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Control numérico</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Define topes de venta y aplica bloqueos operativos sin perder de vista el alcance, la vigencia ni el turno afectado.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {canCreateLimit ? <Button variant="secondary" className="gap-2" onClick={openCreateLimit}><Plus className="h-4 w-4" />Nuevo límite</Button> : null}
        {canCreateBlock ? <Button className="gap-2" onClick={openCreateBlock}><Ban className="h-4 w-4" />Bloquear números</Button> : null}
      </div>
    </header>
  );
}
