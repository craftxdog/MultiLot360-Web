"use client";

import { useNumberLimit } from "../hooks/use-number-control";
import { useNumberControlStore } from "../store/number-control.store";
import { NumberControlDrawer } from "./number-control-drawer";
import { NumberLimitForm } from "./number-limit-form";

export function NumberLimitDrawer() {
  const open = useNumberControlStore((state) => state.limitDrawerOpen);
  const limitId = useNumberControlStore((state) => state.selectedLimitId);
  const close = useNumberControlStore((state) => state.closeLimitDrawer);
  const limit = useNumberLimit(limitId ?? "");
  const editing = Boolean(limitId);

  return (
    <NumberControlDrawer open={open} onOpenChange={(value) => !value && close()} title={editing ? "Editar límite" : "Nuevo límite"} description={editing ? "Ajusta el alcance, monto o vigencia sin perder el historial de la regla." : "Selecciona hasta 100 números y crea sus reglas en una sola operación segura."}>
      {open && editing && limit.isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-muted" /> : null}
      {open && editing && limit.error ? <div role="alert" className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">{limit.error.message}</div> : null}
      {open && (!editing || limit.data) ? <NumberLimitForm key={limit.data?.id ?? "create"} limit={limit.data} onSuccess={close} /> : null}
    </NumberControlDrawer>
  );
}
