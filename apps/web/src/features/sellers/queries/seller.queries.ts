import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { sellersService } from "../services/sellers.service";
import type { SellerDirectoryQuery, SellerInvitationsQuery } from "../types/seller.types";

export const sellerKeys = {
  all: ["sellers"] as const,
  invitations: () => [...sellerKeys.all, "invitations"] as const,
  invitationList: (query: SellerInvitationsQuery) =>
    [...sellerKeys.invitations(), query] as const,
  overview: () => [...sellerKeys.all, "overview"] as const,
  directory: (query: SellerDirectoryQuery) => [...sellerKeys.all, "directory", query] as const,
};

export function sellerInvitationsQueryOptions(query: SellerInvitationsQuery) {
  return queryOptions({
    queryKey: sellerKeys.invitationList(query),
    queryFn: () => sellersService.getInvitations(query),
    placeholderData: keepPreviousData,
  });
}

export function sellerDirectoryQueryOptions(query: SellerDirectoryQuery) {
  return queryOptions({ queryKey: sellerKeys.directory(query), queryFn: () => sellersService.getDirectory(query), placeholderData: keepPreviousData });
}

export function sellerOverviewQueryOptions() {
  return queryOptions({
    queryKey: sellerKeys.overview(),
    queryFn: () => sellersService.getOverview(),
    staleTime: 30_000,
  });
}
