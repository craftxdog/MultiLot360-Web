import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/api/http";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";
import { getAccessToken } from "@/lib/auth/session";
import { shouldRefreshAccessToken } from "@/lib/auth/jwt";
class RouteError extends Error { constructor(message: string, readonly status: number) { super(message); } }
export async function getOperationsToken() { const token = await getAccessToken(); if (token && !shouldRefreshAccessToken(token)) return token; return await getCurrentUserWithRefresh() ? getAccessToken() : null; }
export function assertOperationsOrigin(request: Request) { const origin = request.headers.get("origin"); if (!origin || new URL(origin).origin !== new URL(request.url).origin) throw new RouteError("Origen de solicitud no permitido.", 403); }
export function operationsResponse<T>(data: T, status = 200) { return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } }); }
export function operationsError(error: unknown) { const status = error instanceof RouteError ? error.status : error instanceof ZodError ? 400 : error instanceof ApiError ? error.status : 500; return NextResponse.json({ message: error instanceof Error ? error.message : "No fue posible completar la operación." }, { status, headers: { "Cache-Control": "no-store" } }); }
