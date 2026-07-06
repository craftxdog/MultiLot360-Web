import { z } from "zod";
import { operationsApi } from "@/features/operations/server/operations-api";
import { assertOperationsOrigin, getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { prizesQuerySchema } from "@/features/operations/utils/operations-query";
export async function GET(request: Request) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); return operationsResponse(await operationsApi.prizes(prizesQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)), token)); } catch (error) { return operationsError(error); } }
export async function POST(request: Request) { try { assertOperationsOrigin(request); const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); const input = z.object({ resultId: z.uuid(), saleId: z.uuid() }).parse(await request.json()); return operationsResponse(await operationsApi.payPrize(input, token), 201); } catch (error) { return operationsError(error); } }
