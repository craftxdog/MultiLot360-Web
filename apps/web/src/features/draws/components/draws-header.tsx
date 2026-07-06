"use client";

import { CalendarPlus, Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrawsWorkspaceStore } from "../store/draws-workspace.store";

type DrawsHeaderProps = {
  canCreateConfiguration: boolean;
  canCreateShift: boolean;
};

export function DrawsHeader({
  canCreateConfiguration,
  canCreateShift,
}: DrawsHeaderProps) {
  const openCreateConfiguration = useDrawsWorkspaceStore(
    (state) => state.openCreateConfiguration,
  );
  const openShiftDrawer = useDrawsWorkspaceStore((state) => state.openShiftDrawer);

  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          Centro operativo
        </div>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-foreground">Turnos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Supervisa la operación en tiempo real y administra sus configuraciones sin salir del mismo flujo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canCreateShift ? (
          <Button variant="secondary" onClick={openShiftDrawer}>
            <CalendarPlus className="h-4 w-4" /> Nuevo turno
          </Button>
        ) : null}
        {canCreateConfiguration ? (
          <Button onClick={openCreateConfiguration}>
            <Plus className="h-4 w-4" /> Nueva configuración
          </Button>
        ) : null}
      </div>
    </header>
  );
}
