import { operationsApi } from "@/features/operations/server/operations-api";
import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { reportsQuerySchema } from "@/features/operations/utils/operations-query";
export async function GET(request: Request) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); return operationsResponse(await operationsApi.sellerReports(reportsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)), token)); } catch (error) { return operationsError(error); } }
