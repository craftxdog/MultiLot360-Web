import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { notificationsApi } from "@/features/notifications/server/notifications-api";

export const dynamic = "force-dynamic";
export async function GET() { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); return operationsResponse(await notificationsApi.list(token)); } catch (error) { return operationsError(error); } }
