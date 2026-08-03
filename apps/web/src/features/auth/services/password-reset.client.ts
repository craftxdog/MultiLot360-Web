"use client";

import { ApiError } from "@multilot/api-client";
import { z } from "zod";
import { browserHttp } from "@/lib/api/browser-http";
import {
  confirmPasswordResetSchema,
  confirmPasswordResetLinkSchema,
  requestPasswordResetSchema,
} from "../schemas/password-reset.schema";
import type {
  ConfirmPasswordResetResponse,
  RequestPasswordResetResponse,
} from "../types/auth.types";

export type PasswordResetState = {
  phase: "request" | "confirm" | "confirm-link" | "done";
  email: string;
  message?: string;
  errors?: Record<string, string[]>;
};

function errorMessage(
  error: unknown,
  fallback: string,
  messages: Partial<Record<number, string>> = {},
) {
  return error instanceof ApiError
    ? (messages[error.status] ?? error.message)
    : fallback;
}

export async function submitPasswordReset(
  previous: PasswordResetState,
  formData: FormData,
  recoveryTokenHash?: string,
): Promise<PasswordResetState> {
  const phase = String(formData.get("phase") ?? previous.phase);

  if (phase === "request") {
    const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      return { ...previous, errors: z.flattenError(parsed.error).fieldErrors };
    }

    try {
      const result = await browserHttp<RequestPasswordResetResponse>(
        "/api/auth/password-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "request", ...parsed.data }),
        },
      );
      return { phase: "confirm", email: parsed.data.email, message: result.message };
    } catch (error) {
      return {
        phase: "request",
        email: parsed.data.email,
        message: errorMessage(error, "No pudimos procesar la solicitud. Intenta nuevamente."),
      };
    }
  }

  if (phase === "confirm-link") {
    const parsed = confirmPasswordResetLinkSchema.safeParse({
      tokenHash: recoveryTokenHash,
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      const errors = z.flattenError(parsed.error).fieldErrors;
      return {
        ...previous,
        message: errors.tokenHash?.[0] ?? previous.message,
        errors,
      };
    }

    try {
      await browserHttp<ConfirmPasswordResetResponse>("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "confirm-link", ...parsed.data }),
      });
      return {
        phase: "done",
        email: previous.email,
        message: "Contraseña actualizada. Las sesiones anteriores fueron revocadas.",
      };
    } catch (error) {
      return {
        phase: "confirm-link",
        email: previous.email,
        message: errorMessage(error, "No pudimos restablecer la contraseña.", {
          401: "El enlace es inválido o expiró. Solicita uno nuevo.",
          422: "La nueva contraseña no cumple la política de seguridad.",
          429: "Demasiados intentos. Espera un momento antes de continuar.",
        }),
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
    await browserHttp<ConfirmPasswordResetResponse>("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: "confirm", ...parsed.data }),
    });
    return {
      phase: "done",
      email: parsed.data.email,
      message: "Contraseña actualizada. Las sesiones anteriores fueron revocadas.",
    };
  } catch (error) {
    return {
      phase: "confirm",
      email: parsed.data.email,
      message: errorMessage(error, "No pudimos restablecer la contraseña.", {
        401: "El código es inválido o expiró. Solicita uno nuevo.",
        422: "La nueva contraseña no cumple la política de seguridad.",
        429: "Demasiados intentos. Espera un momento antes de continuar.",
      }),
    };
  }
}
