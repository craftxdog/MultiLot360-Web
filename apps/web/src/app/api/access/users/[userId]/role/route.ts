import { z } from "zod";
import { accessControlApi } from "@/features/access-control/server/access-control-api";
import { assertOperationsOrigin, getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) { try { assertOperationsOrigin(request); const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); const { userId } = await context.params; const { roleId } = z.object({ roleId: z.uuid() }).parse(await request.json()); return operationsResponse(await accessControlApi.assignUserRole(z.uuid().parse(userId), roleId, token)); } catch (error) { return operationsError(error); } }
