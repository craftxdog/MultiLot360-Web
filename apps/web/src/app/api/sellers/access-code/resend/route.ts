import { resendSellerCodeSchema } from "@/features/sellers/schemas/seller-invitation.schema";
import {
  getSellerRouteAccessToken,
  sellerRouteErrorResponse,
  sellerRouteResponse,
  unauthorizedSellerRouteResponse,
  assertSellerMutationOrigin,
} from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";

export async function POST(request: Request) {
  try {
    assertSellerMutationOrigin(request);
    const accessToken = await getSellerRouteAccessToken();

    if (!accessToken) return unauthorizedSellerRouteResponse();

    const { email } = resendSellerCodeSchema.parse(await request.json());

    return sellerRouteResponse(
      await sellersApi.resendAccessCode(email, accessToken),
    );
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}
