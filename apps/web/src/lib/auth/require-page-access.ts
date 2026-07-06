import "server-only";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getCurrentUser } from "@/features/auth/server/get-current-user";

export async function requirePagePermission(permission: string) {
  const user = await getCurrentUser();
  if (!user?.permissions.includes(permission)) redirect(routes.dashboard);
  return user;
}

export async function requirePageAnyPermission(permissions: readonly string[]) {
  const user = await getCurrentUser();
  if (!user || !permissions.some((permission) => user.permissions.includes(permission))) redirect(routes.dashboard);
  return user;
}
