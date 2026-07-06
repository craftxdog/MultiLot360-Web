"use client";

import { useDrawsWorkspaceStore } from "../../store/draws-workspace.store";
import { DrawsDrawer } from "../draws-drawer";
import { DrawShiftForm } from "./draw-shift-form";

export function DrawShiftDrawer() {
  const open = useDrawsWorkspaceStore((state) => state.shiftDrawerOpen);
  const close = useDrawsWorkspaceStore((state) => state.closeShiftDrawer);

  return (
    <DrawsDrawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
      title="Nuevo turno"
      description="Abre un turno operativo desde una configuración activa."
    >
      <DrawShiftForm onSuccess={close} />
    </DrawsDrawer>
  );
}
