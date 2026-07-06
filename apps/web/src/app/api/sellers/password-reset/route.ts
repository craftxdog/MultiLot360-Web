import { adminResetPasswordSchema } from "@/features/auth/schemas/password-reset.schema";
import { getSellerRouteAccessToken, sellerRouteErrorResponse, sellerRouteResponse, unauthorizedSellerRouteResponse, assertSellerMutationOrigin } from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";

export async function POST(request: Request) {
  try {
    assertSellerMutationOrigin(request);
    const token = await getSellerRouteAccessToken();
    if (!token) return unauthorizedSellerRouteResponse();
    const input = adminResetPasswordSchema.parse(await request.json());
    return sellerRouteResponse(await sellersApi.adminResetPassword(input, token));
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}
