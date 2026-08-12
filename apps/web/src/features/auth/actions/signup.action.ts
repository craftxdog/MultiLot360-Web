"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { signupSchema } from "../schemas/signup.schema";
import { authService } from "../services/auth.service";
import { getAuthErrorMessage } from "./auth-action-error";
import type { AuthActionState } from "./auth-action-state";

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    name: formData.get("name"),
    companyName: formData.get("companyName"),
    companySlug: formData.get("companySlug"),
    priceId: formData.get("priceId"),
    paymentMethod: formData.get("paymentMethod"),
    timezone: formData.get("timezone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos e intenta nuevamente.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const payload = {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.name,
      password: parsed.data.password,
      companyName: parsed.data.companyName,
      companySlug: parsed.data.companySlug,
      priceId: parsed.data.priceId,
      paymentMethod: parsed.data.paymentMethod,
      timezone: parsed.data.timezone,
    };
    await authService.signup(payload);
  } catch (error) {
    return {
      ok: false,
      message: getAuthErrorMessage(
        error,
        "No pudimos crear tu cuenta. Intenta nuevamente.",
        {
          403: "El registro inicial está deshabilitado en la API.",
          409: "Ya existe una cuenta con ese correo o usuario.",
          429: "Se alcanzó el límite de altas. Espera un momento antes de intentar nuevamente.",
        },
      ),
      errors: {},
    };
  }

  redirect(
    `${routes.login}?signup=success&tenant=${encodeURIComponent(parsed.data.companySlug)}`,
  );
}
