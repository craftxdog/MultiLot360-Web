"use client";

import { useDrawConfiguration } from "../../hooks/use-draw-configurations";
import { useDrawsWorkspaceStore } from "../../store/draws-workspace.store";
import { DrawsDrawer } from "../draws-drawer";
import { DrawsSkeleton } from "../draws-skeleton";
import { DrawConfigurationForm } from "./draw-configuration-form";

export function DrawConfigurationDrawer() {
  const open = useDrawsWorkspaceStore((state) => state.configurationDrawerOpen);
  const configurationId = useDrawsWorkspaceStore(
    (state) => state.selectedConfigurationId,
  );
  const close = useDrawsWorkspaceStore((state) => state.closeConfigurationDrawer);
  const configuration = useDrawConfiguration(configurationId ?? "");

  return (
    <DrawsDrawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
      title={configurationId ? "Editar configuración" : "Nueva configuración"}
      description="Define código, horario y reglas operativas del sorteo."
    >
      {configurationId && configuration.isLoading ? (
        <DrawsSkeleton className="h-96" />
      ) : configuration.error ? (
        <div role="alert" className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
          {configuration.error.message}
        </div>
      ) : (
        <DrawConfigurationForm
          key={configuration.data?.updatedAt ?? "new"}
          configuration={configuration.data}
          onSuccess={close}
        />
      )}
    </DrawsDrawer>
  );
}
