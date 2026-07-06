"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { clearSessionCookies, getAccessToken } from "@/lib/auth/session";
import { authService } from "../services/auth.service";

export async function logoutAction() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    await authService.logout(accessToken).catch(() => null);
  }

  await clearSessionCookies();

  redirect(routes.login);
}
