import { z } from "zod";
import { accessControlApi } from "@/features/access-control/server/access-control-api";
import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
export async function GET(_request: Request, context: { params: Promise<{ roleId: string }> }) { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); const { roleId } = await context.params; return operationsResponse(await accessControlApi.role(z.uuid().parse(roleId), token)); } catch (error) { return operationsError(error); } }
