import { z } from "zod";
import { assertOperationsOrigin, getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { notificationsApi } from "@/features/notifications/server/notifications-api";

export async function PATCH(request: Request, context: { params: Promise<{ notificationId: string }> }) { try { assertOperationsOrigin(request); const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); const { notificationId } = await context.params; return operationsResponse(await notificationsApi.markRead(z.uuid().parse(notificationId), token)); } catch (error) { return operationsError(error); } }
