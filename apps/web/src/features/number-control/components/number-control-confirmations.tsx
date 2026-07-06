"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNumberControlMutations } from "../hooks/use-number-control-mutations";
import { useNumberControlStore } from "../store/number-control.store";
import { getTodayInManagua } from "../utils/number-control-formatters";

function ConfirmationShell({ open, title, description, children, onClose }: { open: boolean; title: string; description: string; children: React.ReactNode; onClose: () => void }) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><AlertTriangle className="h-5 w-5" /></div><h2 id="confirmation-title" className="mt-4 text-lg font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>{children}</section></div>;
}

export function NumberControlConfirmations() {
  const expireId = useNumberControlStore((state) => state.pendingExpireLimitId);
  const deleteId = useNumberControlStore((state) => state.pendingDeleteBlockId);
  const clearExpire = useNumberControlStore((state) => state.clearExpireLimit);
  const clearDelete = useNumberControlStore((state) => state.clearDeleteBlock);
  const { expireLimit, deleteBlockedNumber } = useNumberControlMutations();
  const [expiresOn, setExpiresOn] = React.useState(getTodayInManagua());

  return <>
    <ConfirmationShell open={Boolean(expireId)} title="Finalizar vigencia" description="La regla dejará de aplicar después de la fecha indicada. El registro se conserva para auditoría." onClose={clearExpire}>
      <div className="mt-5"><Label htmlFor="expiresOn">Último día de vigencia</Label><Input id="expiresOn" type="date" className="mt-2" value={expiresOn} onChange={(event) => setExpiresOn(event.target.value)} /></div>
      <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={clearExpire}>Cancelar</Button><Button disabled={!expiresOn || expireLimit.isPending} onClick={async () => { if (!expireId) return; try { await expireLimit.mutateAsync({ limitId: expireId, expiresOn }); clearExpire(); } catch {} }}>Finalizar</Button></div>
    </ConfirmationShell>
    <ConfirmationShell open={Boolean(deleteId)} title="Liberar número" description="El bloqueo será eliminado y el número podrá volver a venderse según los límites aplicables." onClose={clearDelete}>
      <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={clearDelete}>Cancelar</Button><Button variant="danger" disabled={deleteBlockedNumber.isPending} onClick={async () => { if (!deleteId) return; try { await deleteBlockedNumber.mutateAsync(deleteId); clearDelete(); } catch {} }}>Liberar ahora</Button></div>
    </ConfirmationShell>
  </>;
}
