import { assertOperationsOrigin, getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { notificationsApi } from "@/features/notifications/server/notifications-api";

export async function PATCH(request: Request) { try { assertOperationsOrigin(request); const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); return operationsResponse(await notificationsApi.markAllRead(token)); } catch (error) { return operationsError(error); } }
