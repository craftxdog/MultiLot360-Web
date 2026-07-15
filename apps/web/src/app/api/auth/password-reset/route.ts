import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import {
  confirmPasswordResetSchema,
  requestPasswordResetSchema,
} from "@/features/auth/schemas/password-reset.schema";
import { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/http";
import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

const passwordResetPhaseSchema = z.object({
  phase: z.enum(["request", "confirm"]),
}).passthrough();

function response<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    if (!isTrustedMutationOrigin(request.url, request.headers.get("origin"))) {
      return response({ message: "Origen de solicitud no permitido." }, 403);
    }

    const payload: unknown = await request.json();
    const { phase } = passwordResetPhaseSchema.parse(payload);

    if (phase === "request") {
      const input = requestPasswordResetSchema.parse(payload);
      const result = await authService.requestPasswordReset({ email: input.email });
      return response(result, 202);
    }

    const input = confirmPasswordResetSchema.parse(payload);
    const result = await authService.confirmPasswordReset({
      email: input.email,
      code: input.code,
      newPassword: input.newPassword,
      confirmPassword: input.confirmPassword,
    });
    return response(result);
  } catch (error) {
    const status = error instanceof ZodError
      ? 400
      : error instanceof ApiError && error.status >= 400 && error.status < 600
        ? error.status
        : error instanceof ApiError
          ? 502
          : 500;
    const message = error instanceof ZodError
      ? (error.issues[0]?.message ?? "Revisa los datos enviados.")
      : "No pudimos procesar la solicitud. Intenta nuevamente.";

    return response({ message }, status);
  }
}
