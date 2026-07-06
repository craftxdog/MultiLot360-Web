import { operationsApi } from "@/features/operations/server/operations-api";
import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
export async function GET(_request: Request, context: { params: Promise<{ eventId: string }> }) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); const { eventId } = await context.params; return operationsResponse(await operationsApi.auditEvent(eventId, token)); } catch (error) { return operationsError(error); } }
