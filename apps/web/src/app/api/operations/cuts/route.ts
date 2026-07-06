import { z } from "zod";
import { operationsApi } from "@/features/operations/server/operations-api";
import { assertOperationsOrigin, getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { cutsQuerySchema } from "@/features/operations/utils/operations-query";
const inputSchema = z.object({ startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), description: z.string().trim().max(500).optional(), visibleToSellers: z.boolean().optional() }).refine((v) => v.endDate >= v.startDate, { message: "La fecha final no puede ser anterior." });
export async function GET(request: Request) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); return operationsResponse(await operationsApi.cuts(cutsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)), token)); } catch (error) { return operationsError(error); } }
export async function POST(request: Request) { try { assertOperationsOrigin(request); const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Sesión expirada" }, 401); return operationsResponse(await operationsApi.createCut(inputSchema.parse(await request.json()), token), 201); } catch (error) { return operationsError(error); } }
