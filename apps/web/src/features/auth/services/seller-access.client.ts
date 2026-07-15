"use client";

import { ApiError } from "@multilot/api-client";
import { browserHttp } from "@/lib/api/browser-http";
import {
  manualSellerAccessSchema,
  tokenSellerAccessSchema,
} from "../schemas/seller-access.schema";
import type { ConfirmSellerAccessResponse } from "../types/auth.types";

export type SellerAccessState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Record<string, string[] | undefined>;
};

export const initialSellerAccessState: SellerAccessState = {
  status: "idle",
  message: null,
  errors: {},
};

function fieldErrors(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string[]> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    (errors[field] ??= []).push(issue.message);
  }

  return errors;
}

const GENERIC_INVITATION_ERROR =
  "No pudimos validar la invitación. Usa el código manual o solicita un nuevo enlace a tu administrador.";

export async function submitSellerAccess(
  actionToken: string | undefined,
  _previous: SellerAccessState,
  formData: FormData,
): Promise<SellerAccessState> {
  const parsed = actionToken
    ? tokenSellerAccessSchema.safeParse({
        actionToken,
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
      })
    : manualSellerAccessSchema.safeParse({
        email: formData.get("email"),
        accessCode: formData.get("accessCode"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
      });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos e intenta nuevamente.",
      errors: fieldErrors(parsed.error.issues),
    };
  }

  const payload = "actionToken" in parsed.data
    ? { actionToken: parsed.data.actionToken, password: parsed.data.password }
    : {
        email: parsed.data.email,
        accessCode: parsed.data.accessCode,
        password: parsed.data.password,
      };

  try {
    await browserHttp<ConfirmSellerAccessResponse>(
      "/api/auth/seller-access/confirm",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    return {
      status: "success",
      message: "Acceso activado. Ya puedes iniciar sesión con tu nueva contraseña.",
      errors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError
        ? GENERIC_INVITATION_ERROR
        : "No pudimos procesar la activación. Intenta nuevamente.",
      errors: {},
    };
  }
}
