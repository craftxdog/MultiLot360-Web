import { DrawsBadge } from "../draws-badge";

export function DrawConfigurationStatusBadge({
  active,
}: {
  active: boolean;
}) {
  return active ? (
    <DrawsBadge variant="success">Activa</DrawsBadge>
  ) : (
    <DrawsBadge variant="muted">Inactiva</DrawsBadge>
  );
}
