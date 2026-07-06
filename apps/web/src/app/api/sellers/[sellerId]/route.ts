import { sellerIdSchema } from "@/features/sellers/schemas/seller-invitation.schema";
import {
  assertSellerMutationOrigin,
  getSellerRouteAccessToken,
  sellerRouteErrorResponse,
  sellerRouteResponse,
  unauthorizedSellerRouteResponse,
} from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";

export async function DELETE(request: Request, { params }: { params: Promise<{ sellerId: string }> }) {
  try {
    assertSellerMutationOrigin(request);
    const token = await getSellerRouteAccessToken();
    if (!token) return unauthorizedSellerRouteResponse();
    const sellerId = sellerIdSchema.parse((await params).sellerId);
    const body = await request.json().catch(() => ({}));
    return sellerRouteResponse(await sellersApi.deleteSeller({ sellerId, reason: typeof body.reason === "string" ? body.reason : undefined }, token));
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}
