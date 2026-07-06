import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SellersWorkspace } from "@/features/sellers/components/sellers-workspace";
import { sellerKeys } from "@/features/sellers/queries/seller.queries";
import { sellersApi } from "@/features/sellers/server/sellers-api";
import { parseSellerInvitationsQuery } from "@/features/sellers/utils/seller-query";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";

type SellersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellersPage({ searchParams }: SellersPageProps) {
  const rawParams = await searchParams;
  const params = new URLSearchParams();

  Object.entries(rawParams).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
  });

  const query = parseSellerInvitationsQuery(params);
  const accessToken = await getAccessToken();
  const queryClient = getServerQueryClient();

  if (accessToken) {
    const [invitations, overview] = await Promise.allSettled([
      sellersApi.getInvitations(query, accessToken),
      sellersApi.getOverview(accessToken),
    ]);

    if (invitations.status === "fulfilled") {
      queryClient.setQueryData(sellerKeys.invitationList(query), invitations.value);
    }

    if (overview.status === "fulfilled") {
      queryClient.setQueryData(sellerKeys.overview(), overview.value);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SellersWorkspace />
    </HydrationBoundary>
  );
}
