import { saleIdSchema, voidSaleSchema } from "@/features/sales/schemas/sales.schema";
import { salesApi } from "@/features/sales/server/sales-api";
import { assertSalesMutationOrigin, getSalesAccessToken, salesErrorResponse, salesResponse, unauthorizedSalesResponse } from "@/features/sales/server/sales-route";

export async function PATCH(request: Request, { params }: { params: Promise<{ saleId: string }> }) {
  try {
    assertSalesMutationOrigin(request);
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    const saleId = saleIdSchema.parse((await params).saleId);
    const { reason } = voidSaleSchema.parse(await request.json());
    return salesResponse(await salesApi.voidSale(saleId, reason, token));
  } catch (error) { return salesErrorResponse(error); }
}
