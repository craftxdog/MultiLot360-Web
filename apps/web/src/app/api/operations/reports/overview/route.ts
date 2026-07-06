import { operationsApi } from "@/features/operations/server/operations-api";
import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { reportsQuerySchema } from "@/features/operations/utils/operations-query";
export async function GET(request: Request) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); const parsed = reportsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)); const query = { dateFrom: parsed.dateFrom, dateUntil: parsed.dateUntil, sellerId: parsed.sellerId, drawCode: parsed.drawCode }; return operationsResponse(await operationsApi.report(query, token)); } catch (error) { return operationsError(error); } }
