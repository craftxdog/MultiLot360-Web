"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { setSessionCookies } from "@/lib/auth/session";
import { loginSchema } from "../schemas/login.schema";
import { authService } from "../services/auth.service";
import { getAuthErrorMessage } from "./auth-action-error";
import type { AuthActionState } from "./auth-action-state";

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos e intenta nuevamente.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const session = await authService.login(parsed.data);

    await setSessionCookies(session);
  } catch (error) {
    return {
      ok: false,
      message: getAuthErrorMessage(
        error,
        "No pudimos iniciar sesión. Intenta nuevamente.",
        {
          401: "El correo o la contraseña no son correctos.",
          403: "Tu acceso está inactivo. Contacta a un administrador.",
        },
      ),
      errors: {},
    };
  }

  const next = getSafeRedirectPath(formData.get("next"));

  redirect(next);
}
