"use client";

import { Lock, RotateCcw, XCircle } from "lucide-react";
import { useDrawsWorkspaceStore } from "../../store/draws-workspace.store";
import { getAllowedDrawShiftActions } from "../../utils/draw-actions";
import type { DrawShiftStatus } from "../../types/draws.types";

type DrawShiftActionsCellProps = {
  row: {
    id: string;
    status: DrawShiftStatus;
    configurationCode: string;
  };
  canUpdate?: boolean;
  showLabels?: boolean;
};

const actionConfig = {
  block: { label: "Bloquear", icon: Lock, danger: false },
  reopen: { label: "Reabrir", icon: RotateCcw, danger: false },
  close: { label: "Cerrar", icon: XCircle, danger: true },
} as const;

export function DrawShiftActionsCell({
  row,
  canUpdate = true,
  showLabels = false,
}: DrawShiftActionsCellProps) {
  const requestShiftAction = useDrawsWorkspaceStore(
    (state) => state.requestShiftAction,
  );

  if (!canUpdate) {
    return <span className="text-xs text-muted-foreground">Solo lectura</span>;
  }

  return (
    <div className="flex h-full items-center justify-end gap-1.5">
      {getAllowedDrawShiftActions(row.status).map((action) => {
        const config = actionConfig[action];
        const Icon = config.icon;

        return (
          <button
            key={action}
            type="button"
            onClick={() =>
              requestShiftAction({
                shiftId: row.id,
                configurationCode: row.configurationCode,
                status: row.status,
                action,
              })
            }
            className={
              config.danger
                ? "inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger/20 px-2.5 text-xs text-danger transition hover:bg-danger/10"
                : "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            }
            aria-label={`${config.label} ${row.configurationCode}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className={showLabels ? undefined : "hidden xl:inline"}>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
