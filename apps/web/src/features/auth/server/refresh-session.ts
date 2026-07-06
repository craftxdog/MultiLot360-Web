import { authService } from "../services/auth.service";
import type { AuthSession } from "../types/auth.types";

const pendingRefreshes = new Map<string, Promise<AuthSession>>();

export function refreshSession(refreshToken: string) {
  const pending = pendingRefreshes.get(refreshToken);

  if (pending) {
    return pending;
  }

  const refresh = authService
    .refresh({ refreshToken })
    .finally(() => pendingRefreshes.delete(refreshToken));

  pendingRefreshes.set(refreshToken, refresh);

  return refresh;
}
