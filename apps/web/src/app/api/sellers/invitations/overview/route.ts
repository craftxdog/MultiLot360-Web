import {
  getSellerRouteAccessToken,
  sellerRouteErrorResponse,
  sellerRouteResponse,
  unauthorizedSellerRouteResponse,
} from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accessToken = await getSellerRouteAccessToken();

    if (!accessToken) return unauthorizedSellerRouteResponse();

    return sellerRouteResponse(await sellersApi.getOverview(accessToken));
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}
