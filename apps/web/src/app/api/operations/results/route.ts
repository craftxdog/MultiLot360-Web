import { z } from "zod";
import { operationsApi } from "@/features/operations/server/operations-api";
import { assertOperationsOrigin, getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { resultsQuerySchema } from "@/features/operations/utils/operations-query";
export async function GET(request: Request) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); return operationsResponse(await operationsApi.results(resultsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)), token)); } catch (error) { return operationsError(error); } }
export async function POST(request: Request) { try { assertOperationsOrigin(request); const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); const input = z.object({ shiftId: z.uuid(), winningNumber: z.string().regex(/^\d{2}$/) }).parse(await request.json()); return operationsResponse(await operationsApi.createResult(input, token), 201); } catch (error) { return operationsError(error); } }
