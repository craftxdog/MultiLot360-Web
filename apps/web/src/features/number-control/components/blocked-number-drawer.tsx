"use client";

import { Ban, CalendarDays, Clock3, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlockedNumber } from "../hooks/use-number-control";
import { useNumberControlStore } from "../store/number-control.store";
import { formatControlDate, formatControlDateTime } from "../utils/number-control-formatters";
import { BlockedNumberForm } from "./blocked-number-form";
import { NumberControlDrawer } from "./number-control-drawer";

export function BlockedNumberDrawer({ canDelete }: { canDelete: boolean }) {
  const open = useNumberControlStore((state) => state.blockDrawerOpen);
  const blockId = useNumberControlStore((state) => state.selectedBlockId);
  const close = useNumberControlStore((state) => state.closeBlockDrawer);
  const requestDelete = useNumberControlStore((state) => state.requestDeleteBlock);
  const block = useBlockedNumber(blockId ?? "");
  const details = Boolean(blockId);

  return (
    <NumberControlDrawer open={open} onOpenChange={(value) => !value && close()} title={details ? "Detalle del bloqueo" : "Bloquear números"} description={details ? "Trazabilidad completa de la excepción operativa." : "Aplica una excepción por fecha o por turno a uno o varios números."}>
      {open && !details ? <BlockedNumberForm onSuccess={close} /> : null}
      {details && block.isLoading ? <div className="h-80 animate-pulse rounded-2xl bg-muted" /> : null}
      {details && block.error ? <div role="alert" className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">{block.error.message}</div> : null}
      {block.data ? <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/8 p-5"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-xl font-semibold text-white shadow-lg shadow-rose-500/20">{block.data.number}</span><div><p className="text-xs uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">Número bloqueado</p><p className="mt-1 text-sm text-muted-foreground">{block.data.scope === "DATE" ? "Cobertura de día completo" : "Cobertura de turno"}</p></div></div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Aplicación</dt><dd className="mt-2 text-sm font-medium text-foreground">{block.data.date ? formatControlDate(block.data.date) : block.data.shift ? `${block.data.shift.configuration.code} · ${formatControlDate(block.data.shift.date)}` : "—"}</dd></div>
          <div className="rounded-2xl border border-border p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />Registrado</dt><dd className="mt-2 text-sm font-medium text-foreground">{formatControlDateTime(block.data.createdAt)}</dd></div>
          <div className="rounded-2xl border border-border p-4 sm:col-span-2"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" />Responsable</dt><dd className="mt-2 text-sm font-medium text-foreground">{block.data.createdBy?.name ?? block.data.createdBy?.username ?? "Sistema"}</dd></div>
        </dl>
        <div className="rounded-2xl border border-border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Motivo</p><p className="mt-2 text-sm leading-6 text-foreground">{block.data.reason || "Sin motivo registrado."}</p></div>
        {canDelete ? <Button variant="danger" className="w-full gap-2" onClick={() => { requestDelete(block.data.id); close(); }}><Ban className="h-4 w-4" />Liberar número</Button> : null}
      </div> : null}
    </NumberControlDrawer>
  );
}
