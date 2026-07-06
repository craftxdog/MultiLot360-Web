import { accessControlApi } from "@/features/access-control/server/access-control-api";
import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
export async function GET() { try { const token = await getOperationsToken(); if (!token) return operationsResponse({ message: "Tu sesión expiró." }, 401); return operationsResponse(await accessControlApi.modules(token)); } catch (error) { return operationsError(error); } }
