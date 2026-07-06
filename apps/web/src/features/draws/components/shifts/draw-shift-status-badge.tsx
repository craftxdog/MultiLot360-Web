import { DrawsBadge } from "../draws-badge";
import type { DrawShiftStatus } from "../../types/draws.types";

export function DrawShiftStatusBadge({
  status,
}: {
  status: DrawShiftStatus;
}) {
  if (status === "ABIERTO") {
    return <DrawsBadge variant="success">Abierto</DrawsBadge>;
  }

  if (status === "BLOQUEO") {
    return <DrawsBadge variant="warning">Bloqueado</DrawsBadge>;
  }

  return <DrawsBadge variant="muted">Cerrado</DrawsBadge>;
}
