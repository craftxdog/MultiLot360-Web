import { salesApi } from "@/features/sales/server/sales-api";
import { getSalesAccessToken, salesErrorResponse, salesResponse, unauthorizedSalesResponse } from "@/features/sales/server/sales-route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    return salesResponse(await salesApi.getOverview(token));
  } catch (error) { return salesErrorResponse(error); }
}
