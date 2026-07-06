"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { setSessionCookies } from "@/lib/auth/session";
import { sellerAccessSchema } from "../schemas/seller-access.schema";
import { authService } from "../services/auth.service";
import { getAuthErrorMessage } from "./auth-action-error";
import type { AuthActionState } from "./auth-action-state";

export async function confirmSellerAccessAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = sellerAccessSchema.safeParse({
    email: formData.get("email"),
    accessCode: formData.get("accessCode"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos e intenta nuevamente.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { email, accessCode, password } = parsed.data;

  try {
    await authService.confirmSellerAccess({ email, accessCode, password });

    const session = await authService.login({ email, password });

    await setSessionCookies(session);
  } catch (error) {
    return {
      ok: false,
      message: getAuthErrorMessage(
        error,
        "No pudimos activar tu acceso. Verifica el código e intenta nuevamente.",
        {
          400: "El código no es válido o ya fue utilizado.",
          404: "No encontramos una invitación activa para ese correo.",
          410: "El código expiró. Solicita uno nuevo al administrador.",
        },
      ),
      errors: {},
    };
  }

  const next = getSafeRedirectPath(formData.get("next"));

  redirect(next);
}
