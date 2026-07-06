import "server-only";

import { cache } from "react";
import { ApiError } from "@/lib/api/http";
import {
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
  setSessionCookies,
} from "@/lib/auth/session";
import { authService } from "../services/auth.service";
import { refreshSession } from "./refresh-session";

async function readCurrentUser() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    return (await authService.me(accessToken)).user;
  } catch (error) {
    if (error instanceof ApiError && error.isStatus(401, 403)) {
      return null;
    }

    throw error;
  }
}

export const getCurrentUser = cache(readCurrentUser);

export async function getCurrentUserWithRefresh() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      return (await authService.me(accessToken)).user;
    } catch (error) {
      if (!(error instanceof ApiError) || !error.isStatus(401)) {
        throw error;
      }
    }
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const session = await refreshSession(refreshToken);

    await setSessionCookies(session);

    return (await authService.me(session.accessToken)).user;
  } catch (error) {
    if (error instanceof ApiError && error.isStatus(401, 403)) {
      await clearSessionCookies();
      return null;
    }

    throw error;
  }
}
