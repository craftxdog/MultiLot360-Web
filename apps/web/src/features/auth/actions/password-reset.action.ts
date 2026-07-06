"use server";

import { z } from "zod";
import { authService } from "../services/auth.service";
import {
  confirmPasswordResetSchema,
  requestPasswordResetSchema,
} from "../schemas/password-reset.schema";
import { getAuthErrorMessage } from "./auth-action-error";

export type PasswordResetState = {
  phase: "request" | "confirm" | "done";
  email: string;
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialPasswordResetState: PasswordResetState = {
  phase: "request",
  email: "",
};

export async function passwordResetAction(
  previous: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const phase = String(formData.get("phase") ?? previous.phase);

  if (phase === "request") {
    const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      return { ...previous, errors: z.flattenError(parsed.error).fieldErrors };
    }

    try {
      const response = await authService.requestPasswordReset(parsed.data);
      return { phase: "confirm", email: parsed.data.email, message: response.message };
    } catch (error) {
      return {
        phase: "request",
        email: parsed.data.email,
        message: getAuthErrorMessage(error, "No pudimos procesar la solicitud. Intenta nuevamente."),
      };
    }
  }

  const parsed = confirmPasswordResetSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ...previous, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await authService.confirmPasswordReset(parsed.data);
    return {
      phase: "done",
      email: parsed.data.email,
      message: "Contraseña actualizada. Las sesiones anteriores fueron revocadas.",
    };
  } catch (error) {
    return {
      phase: "confirm",
      email: parsed.data.email,
      message: getAuthErrorMessage(error, "No pudimos restablecer la contraseña.", {
        401: "El código es inválido o expiró. Solicita uno nuevo.",
        422: "La nueva contraseña no cumple la política de seguridad.",
        429: "Demasiados intentos. Espera un momento antes de continuar.",
      }),
    };
  }
}
