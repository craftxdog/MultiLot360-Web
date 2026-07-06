import { sellerInvitationsQuerySchema } from "@/features/sellers/schemas/seller-invitation.schema";
import {
  getSellerRouteAccessToken,
  sellerRouteErrorResponse,
  sellerRouteResponse,
  unauthorizedSellerRouteResponse,
  assertSellerMutationOrigin,
} from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";
import { createSellerInvitationSchema } from "@/features/sellers/schemas/seller-invitation.schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const accessToken = await getSellerRouteAccessToken();

    if (!accessToken) return unauthorizedSellerRouteResponse();

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const query = sellerInvitationsQuerySchema.parse(params);
    const result = await sellersApi.getInvitations(query, accessToken);

    return sellerRouteResponse(result);
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSellerMutationOrigin(request);
    const accessToken = await getSellerRouteAccessToken();

    if (!accessToken) return unauthorizedSellerRouteResponse();

    const input = createSellerInvitationSchema.parse(await request.json());
    const invitation = await sellersApi.createInvitation(input, accessToken);

    return sellerRouteResponse(invitation, 201);
  } catch (error) {
    return sellerRouteErrorResponse(error);
  }
}
