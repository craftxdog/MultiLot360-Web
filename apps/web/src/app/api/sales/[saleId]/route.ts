import { saleIdSchema } from "@/features/sales/schemas/sales.schema";
import { salesApi } from "@/features/sales/server/sales-api";
import { getSalesAccessToken, salesErrorResponse, salesResponse, unauthorizedSalesResponse } from "@/features/sales/server/sales-route";

export async function GET(_request: Request, { params }: { params: Promise<{ saleId: string }> }) {
  try {
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    const saleId = saleIdSchema.parse((await params).saleId);
    return salesResponse(await salesApi.getSale(saleId, token));
  } catch (error) { return salesErrorResponse(error); }
}
