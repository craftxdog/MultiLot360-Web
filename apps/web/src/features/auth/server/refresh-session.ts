import { authService } from "../services/auth.service";
import type { AuthSession } from "../types/auth.types";

const pendingRefreshes = new Map<string, Promise<AuthSession>>();

export function refreshSession(refreshToken: string, tenant?: string) {
  const refreshKey = `${refreshToken}:${tenant ?? ""}`;
  const pending = pendingRefreshes.get(refreshKey);

  if (pending) {
    return pending;
  }

  const refresh = authService
    .refresh({ refreshToken, ...(tenant ? { tenant } : {}) })
    .finally(() => pendingRefreshes.delete(refreshKey));

  pendingRefreshes.set(refreshKey, refresh);

  return refresh;
}
