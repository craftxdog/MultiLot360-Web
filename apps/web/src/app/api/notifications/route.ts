import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { notificationsApi } from "@/features/notifications/server/notifications-api";
import { notificationsQuerySchema } from "@/features/notifications/utils/notification-query";

export const dynamic = "force-dynamic";
export async function GET(request: Request) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); const query = notificationsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)); return operationsResponse(await notificationsApi.list(query, token)); } catch (error) { return operationsError(error); } }
