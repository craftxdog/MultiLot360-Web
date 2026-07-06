import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";
import { ApiError } from "@/lib/api/http";
import { shouldRefreshAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";
import { isTrustedSalesOrigin } from "../utils/sales-security";

class SalesRouteError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function getSalesAccessToken() {
  const token = await getAccessToken();
  if (token && !shouldRefreshAccessToken(token)) return token;
  const user = await getCurrentUserWithRefresh();
  return user ? getAccessToken() : null;
}

export function assertSalesMutationOrigin(request: Request) {
  if (!isTrustedSalesOrigin(request.url, request.headers.get("origin"))) throw new SalesRouteError("Origen de solicitud no permitido.", 403);
}

export function unauthorizedSalesResponse() {
  return NextResponse.json({ message: "Tu sesión expiró. Inicia sesión nuevamente." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

function translateSalesMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("number is blocked")) return "Uno de los números está bloqueado para este turno.";
  if (normalized.includes("number limit reached")) return "La venta supera el límite disponible para uno de los números.";
  if (normalized.includes("draw shift is closed")) return "El turno ya no está abierto para recibir ventas.";
  if (normalized.includes("seller is inactive")) return "El vendedor está inactivo y no puede registrar ventas.";
  if (normalized.includes("seller not found")) return "No se encontró el vendedor seleccionado.";
  if (normalized.includes("draw shift not found")) return "No se encontró el turno seleccionado.";
  if (normalized.includes("already voided")) return "La venta ya fue anulada.";
  if (normalized.includes("while its draw shift is open")) return "La venta solo puede anularse mientras el turno permanezca abierto.";
  const voidWindow = message.match(/within (\d+) minutes/i);
  if (voidWindow) return `La venta solo puede anularse durante los primeros ${voidWindow[1]} minutos.`;
  return message;
}

export function salesErrorResponse(error: unknown) {
  const status = error instanceof SalesRouteError ? error.status : error instanceof ZodError ? 400 : error instanceof ApiError && error.status >= 400 && error.status < 600 ? error.status : 500;
  const raw = error instanceof ZodError ? (error.issues[0]?.message ?? "Revisa los datos de la venta.") : error instanceof Error ? error.message : "No fue posible completar la operación de venta.";
  return NextResponse.json({ message: translateSalesMessage(raw) }, { status, headers: { "Cache-Control": "no-store" } });
}

export function salesResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}
