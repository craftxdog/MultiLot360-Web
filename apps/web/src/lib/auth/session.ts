import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "@/features/auth/types/auth.types";
import {
  authCookieNames,
  getAccessCookieOptions,
  getRefreshCookieOptions,
  getTenantCookieOptions,
} from "./cookies";

export async function setSessionCookies(session: AuthSession) {
  if (!session.accessToken || !session.refreshToken) {
    throw new Error("Invalid auth session received from API.");
  }

  const cookieStore = await cookies();

  cookieStore.set(
    authCookieNames.access,
    session.accessToken,
    getAccessCookieOptions(session.expiresIn),
  );

  const tenantSelector = session.user.tenant?.id ?? session.user.tenant?.slug;
  if (tenantSelector) {
    cookieStore.set(
      authCookieNames.tenant,
      tenantSelector,
      getTenantCookieOptions(),
    );
  }

  cookieStore.set(
    authCookieNames.refresh,
    session.refreshToken,
    getRefreshCookieOptions(),
  );
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(authCookieNames.access);
  cookieStore.delete(authCookieNames.refresh);
  cookieStore.delete(authCookieNames.tenant);
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get(authCookieNames.access)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();

  return cookieStore.get(authCookieNames.refresh)?.value;
}

export async function getTenantSelector() {
  const cookieStore = await cookies();

  return cookieStore.get(authCookieNames.tenant)?.value;
}

export const sessionCookieNames = authCookieNames;
