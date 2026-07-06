import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SellersWorkspace } from "@/features/sellers/components/sellers-workspace";
import { sellerKeys } from "@/features/sellers/queries/seller.queries";
import { sellersApi } from "@/features/sellers/server/sellers-api";
import { parseSellerInvitationsQuery } from "@/features/sellers/utils/seller-query";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";
import { requirePageAnyPermission } from "@/lib/auth/require-page-access";
import type { SellerDirectoryQuery } from "@/features/sellers/types/seller.types";

type SellersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellersPage({ searchParams }: SellersPageProps) {
  const user = await requirePageAnyPermission(["vendedores.read", "usuarios.read"]);
  const rawParams = await searchParams;
  const params = new URLSearchParams();

  Object.entries(rawParams).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
  });

  const query = parseSellerInvitationsQuery(params);
  const requestedFlow = params.get("view") === "flow" || params.get("view") === "kanban";
  const view = requestedFlow && user.permissions.includes("usuarios.read") ? "flow" : user.permissions.includes("vendedores.read") ? "directory" : "flow";
  const directoryQuery: SellerDirectoryQuery = { search: params.get("search") || undefined, active: params.get("active") === "true" ? true : params.get("active") === "false" ? false : undefined, page: Math.max(1, Number(params.get("page")) || 1), limit: Math.min(100, Math.max(1, Number(params.get("limit")) || 10)), sortBy: "name", sortDirection: "asc" };
  const accessToken = await getAccessToken();
  const queryClient = getServerQueryClient();

  if (accessToken) {
    const [invitations, overview, directory] = await Promise.allSettled([
      view === "flow" ? sellersApi.getInvitations(query, accessToken) : Promise.resolve(null),
      view === "flow" ? sellersApi.getOverview(accessToken) : Promise.resolve(null),
      view === "directory" ? sellersApi.getDirectory(directoryQuery, accessToken) : Promise.resolve(null),
    ]);

    if (invitations.status === "fulfilled" && invitations.value) {
      queryClient.setQueryData(sellerKeys.invitationList(query), invitations.value);
    }

    if (overview.status === "fulfilled" && overview.value) {
      queryClient.setQueryData(sellerKeys.overview(), overview.value);
    }
    if (directory.status === "fulfilled" && directory.value) queryClient.setQueryData(sellerKeys.directory(directoryQuery), directory.value);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SellersWorkspace />
    </HydrationBoundary>
  );
}
