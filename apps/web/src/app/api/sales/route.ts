import { createSaleSchema, salesQuerySchema } from "@/features/sales/schemas/sales.schema";
import { salesApi } from "@/features/sales/server/sales-api";
import { assertSalesMutationOrigin, getSalesAccessToken, salesErrorResponse, salesResponse, unauthorizedSalesResponse } from "@/features/sales/server/sales-route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    const query = salesQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return salesResponse(await salesApi.getSales(query, token));
  } catch (error) { return salesErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    assertSalesMutationOrigin(request);
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    const input = createSaleSchema.parse(await request.json());
    return salesResponse(await salesApi.createSale(input, token), 201);
  } catch (error) { return salesErrorResponse(error); }
}
