import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@multilot/api-client";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";
import { getAccessToken } from "@/lib/auth/session";
import { shouldRefreshAccessToken } from "@/lib/auth/jwt";
import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

class BillingRouteError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function getBillingAccessToken() {
  const token = await getAccessToken();
  if (token && !shouldRefreshAccessToken(token)) return token;
  return (await getCurrentUserWithRefresh()) ? getAccessToken() : null;
}

export function assertBillingMutationOrigin(request: Request) {
  if (!isTrustedMutationOrigin(request.url, request.headers.get("origin"))) {
    throw new BillingRouteError("Origen de solicitud no permitido.", 403);
  }
}

export function billingResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export function billingUnauthorizedResponse() {
  return NextResponse.json(
    { message: "Tu sesión expiró. Inicia sesión nuevamente." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

export function billingErrorResponse(error: unknown) {
  const status =
    error instanceof BillingRouteError
      ? error.status
      : error instanceof ZodError
        ? 400
        : error instanceof ApiError && error.status >= 400 && error.status < 600
          ? error.status
          : 500;
  const message =
    error instanceof ZodError
      ? (error.issues[0]?.message ?? "Revisa los datos enviados.")
      : error instanceof Error
        ? error.message
        : "No fue posible completar la operación de facturación.";

  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
