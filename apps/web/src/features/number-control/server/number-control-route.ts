import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";
import { ApiError } from "@/lib/api/http";
import { shouldRefreshAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";
import { isTrustedNumberControlOrigin } from "../utils/number-control-security";

class NumberControlRouteError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function getNumberControlAccessToken() {
  const accessToken = await getAccessToken();
  if (accessToken && !shouldRefreshAccessToken(accessToken)) return accessToken;
  const user = await getCurrentUserWithRefresh();
  return user ? getAccessToken() : null;
}

export function assertNumberControlMutationOrigin(request: Request) {
  if (!isTrustedNumberControlOrigin(request.url, request.headers.get("origin"))) {
    throw new NumberControlRouteError("Origen de solicitud no permitido.", 403);
  }
}

export function unauthorizedNumberControlResponse() {
  return NextResponse.json(
    { message: "Tu sesión expiró. Inicia sesión nuevamente." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

export function numberControlErrorResponse(error: unknown) {
  const status = error instanceof NumberControlRouteError
    ? error.status
    : error instanceof ZodError
      ? 400
      : error instanceof ApiError && error.status >= 400 && error.status < 600
        ? error.status
        : 500;
  const message = error instanceof ZodError
    ? (error.issues[0]?.message ?? "Revisa los datos enviados.")
    : error instanceof Error
      ? error.message
      : "No fue posible completar la operación de control numérico.";

  return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

export function numberControlResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
