import { salesVoidPolicySchema } from "@/features/sales/schemas/sales.schema";
import { salesApi } from "@/features/sales/server/sales-api";
import { assertSalesMutationOrigin, getSalesAccessToken, salesErrorResponse, salesResponse, unauthorizedSalesResponse } from "@/features/sales/server/sales-route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    return salesResponse(await salesApi.getVoidPolicy(token));
  } catch (error) { return salesErrorResponse(error); }
}

export async function PATCH(request: Request) {
  try {
    assertSalesMutationOrigin(request);
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    const { windowMinutes } = salesVoidPolicySchema.parse(await request.json());
    return salesResponse(await salesApi.updateVoidPolicy(windowMinutes, token));
  } catch (error) { return salesErrorResponse(error); }
}
