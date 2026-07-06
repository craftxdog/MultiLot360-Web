import { useQuery } from "@tanstack/react-query";
import {
  sellerInvitationsQueryOptions,
  sellerOverviewQueryOptions,
} from "../queries/seller.queries";
import type { SellerInvitationsQuery } from "../types/seller.types";

export function useSellerInvitations(query: SellerInvitationsQuery) {
  return useQuery(sellerInvitationsQueryOptions(query));
}

export function useSellerOverview() {
  return useQuery(sellerOverviewQueryOptions());
}
