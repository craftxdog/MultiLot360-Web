"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { setSessionCookies } from "@/lib/auth/session";
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
    };
    const session = await authService.signup(payload);

    await setSessionCookies(session);
  } catch (error) {
    return {
      ok: false,
      message: getAuthErrorMessage(
        error,
        "No pudimos crear tu cuenta. Intenta nuevamente.",
        {
          403: "El registro inicial está deshabilitado en la API.",
          409: "Ya existe una cuenta con ese correo o usuario.",
        },
      ),
      errors: {},
    };
  }

  redirect(routes.dashboard);
}
