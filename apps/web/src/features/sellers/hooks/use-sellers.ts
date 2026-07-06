import { useQuery } from "@tanstack/react-query";
import {
  sellerInvitationsQueryOptions,
  sellerOverviewQueryOptions,
  sellerDirectoryQueryOptions,
} from "../queries/seller.queries";
import type { SellerDirectoryQuery, SellerInvitationsQuery } from "../types/seller.types";

export function useSellerInvitations(query: SellerInvitationsQuery, enabled = true) {
  return useQuery({ ...sellerInvitationsQueryOptions(query), enabled });
}

export function useSellerDirectory(query: SellerDirectoryQuery, enabled = true) { return useQuery({ ...sellerDirectoryQueryOptions(query), enabled }); }

export function useSellerOverview() {
  return useQuery(sellerOverviewQueryOptions());
}
