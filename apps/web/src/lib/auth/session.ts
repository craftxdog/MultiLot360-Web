import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "@/features/auth/types/auth.types";
import {
  authCookieNames,
  getAccessCookieOptions,
  getRefreshCookieOptions,
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
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get(authCookieNames.access)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();

  return cookieStore.get(authCookieNames.refresh)?.value;
}

export const sessionCookieNames = authCookieNames;
