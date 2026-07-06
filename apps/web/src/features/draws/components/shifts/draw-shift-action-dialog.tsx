"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useDrawShiftMutations } from "../../hooks/use-draw-shift-mutations";
import { useDrawsWorkspaceStore } from "../../store/draws-workspace.store";
import { drawShiftActionCopy } from "../../utils/draw-actions";

export function DrawShiftActionDialog() {
  const pendingAction = useDrawsWorkspaceStore((state) => state.pendingShiftAction);
  const clearShiftAction = useDrawsWorkspaceStore((state) => state.clearShiftAction);
  const mutations = useDrawShiftMutations();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pendingAction) return;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const focusFrame = window.requestAnimationFrame(() => {
      confirmButtonRef.current?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearShiftAction();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", closeOnEscape);
      previousActiveElement?.focus();
    };
  }, [clearShiftAction, pendingAction]);

  if (!pendingAction) return null;

  const copy = drawShiftActionCopy[pendingAction.action];
  const shiftId = pendingAction.shiftId;
  const mutation =
    pendingAction.action === "block"
      ? mutations.blockShift
      : pendingAction.action === "reopen"
        ? mutations.reopenShift
        : mutations.closeShift;

  async function confirm() {
    try {
      await mutation.mutateAsync(shiftId);
      clearShiftAction();
    } catch {
      // La mutación conserva el diálogo y muestra el error normalizado.
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="draw-action-title"
        aria-describedby="draw-action-description"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <h2 id="draw-action-title" className="mt-5 text-lg font-medium">
          {copy.title}
        </h2>
        <p id="draw-action-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.description} Turno: <span className="text-foreground">{pendingAction.configurationCode}</span>.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={clearShiftAction} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={pendingAction.action === "close" ? "danger" : "primary"}
            onClick={() => void confirm()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? copy.pending : copy.confirm}
          </Button>
        </div>
      </section>
    </div>
  );
}
