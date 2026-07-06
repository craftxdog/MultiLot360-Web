import { revokeSellerInvitationSchema } from "@/features/sellers/schemas/seller-invitation.schema";
import {
  getSellerRouteAccessToken,
  sellerRouteErrorResponse,
  sellerRouteResponse,
  unauthorizedSellerRouteResponse,
  assertSellerMutationOrigin,
} from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";

type RevokeInvitationRouteContext = {
  params: Promise<{ invitationId: string }>;
};

export async function PATCH(
  request: Request,
  context: RevokeInvitationRouteContext,
) {
  try {
    assertSellerMutationOrigin(request);
    const accessToken = await getSellerRouteAccessToken();

    if (!accessToken) return unauthorizedSellerRouteResponse();

    const input = revokeSellerInvitationSchema.parse(await context.params);

    return sellerRouteResponse(
      await sellersApi.revokeInvitation(input.invitationId, accessToken),
    );
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}
