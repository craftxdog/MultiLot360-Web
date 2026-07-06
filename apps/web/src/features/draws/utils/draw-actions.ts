import type { DrawShiftAction, DrawShiftStatus } from "../types/draws.types";

export function getAllowedDrawShiftActions(status: DrawShiftStatus): DrawShiftAction[] {
  if (status === "ABIERTO") return ["block", "close"];
  if (status === "BLOQUEO") return ["reopen", "close"];
  return [];
}

export const drawShiftActionCopy: Record<
  DrawShiftAction,
  { title: string; description: string; confirm: string; pending: string }
> = {
  block: {
    title: "Bloquear turno",
    description: "Las ventas quedarán temporalmente detenidas para este turno.",
    confirm: "Bloquear turno",
    pending: "Bloqueando...",
  },
  reopen: {
    title: "Reabrir turno",
    description: "El turno volverá a aceptar operación según sus reglas vigentes.",
    confirm: "Reabrir turno",
    pending: "Reabriendo...",
  },
  close: {
    title: "Cerrar turno",
    description: "El cierre finaliza la operación del turno y no podrá reabrirse.",
    confirm: "Cerrar definitivamente",
    pending: "Cerrando...",
  },
};
