import { salesMatrixApi } from "@/features/sales-matrix/server/sales-matrix-api";
import { salesMatrixQuerySchema } from "@/features/sales-matrix/utils/sales-matrix-query";
import { getSalesAccessToken, salesErrorResponse, salesResponse, unauthorizedSalesResponse } from "@/features/sales/server/sales-route";

export async function GET(request: Request) {
  try {
    const token = await getSalesAccessToken();
    if (!token) return unauthorizedSalesResponse();
    const url = new URL(request.url);
    const query = salesMatrixQuerySchema.parse(Object.fromEntries(url.searchParams));
    return salesResponse(await salesMatrixApi.get(query, token));
  } catch (error) {
    return salesErrorResponse(error);
  }
}
