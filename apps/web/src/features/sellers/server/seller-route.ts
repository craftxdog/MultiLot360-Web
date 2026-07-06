import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";
import { ApiError } from "@/lib/api/http";
import { shouldRefreshAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";

class SellerRouteError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export function assertSellerMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== new URL(request.url).origin) {
    throw new SellerRouteError("Origen de solicitud no permitido.", 403);
  }
}

export async function getSellerRouteAccessToken() {
  const currentAccessToken = await getAccessToken();

  if (
    currentAccessToken &&
    !shouldRefreshAccessToken(currentAccessToken)
  ) {
    return currentAccessToken;
  }

  const user = await getCurrentUserWithRefresh();

  if (!user) return null;

  return getAccessToken();
}

export function unauthorizedSellerRouteResponse() {
  return NextResponse.json(
    { message: "Tu sesión expiró. Inicia sesión nuevamente." },
    {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function sellerRouteErrorResponse(error: unknown) {
  const status =
    error instanceof SellerRouteError
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
      : "No fue posible completar la solicitud.";

  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function sellerRouteResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
