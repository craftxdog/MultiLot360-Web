import "server-only";

import { http, httpEnvelope } from "@/lib/api/http";
import { buildSellerQueryString } from "../utils/seller-query";
import type {
  CreateSellerInvitationPayload,
  ResendSellerAccessCodeResponse,
  RevokeSellerInvitationResponse,
  SellerInvitation,
  SellerInvitationResponse,
  SellerInvitationsQuery,
  SellerInvitationsResult,
  SellerOverview,
  SellerDirectoryItem,
  SellerDirectoryQuery,
  SellerDirectoryResult,
  SellerMutationResponse,
} from "../types/seller.types";
import type { AdminResetPasswordPayload, AdminResetPasswordResponse } from "@/features/auth/types/auth.types";

function fallbackPagination(
  query: SellerInvitationsQuery,
  count: number,
): SellerInvitationsResult["pagination"] {
  return {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    count,
    total: count,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export const sellersApi = {
  async getDirectory(query: SellerDirectoryQuery, accessToken: string): Promise<SellerDirectoryResult> {
    const params = new URLSearchParams();
    params.set("page", String(query.page ?? 1));
    params.set("limit", String(query.limit ?? 10));
    params.set("sortBy", query.sortBy ?? "name");
    params.set("sortDirection", query.sortDirection ?? "asc");
    if (query.search) params.set("search", query.search);
    if (query.active !== undefined) params.set("active", String(query.active));
    const envelope = await httpEnvelope<SellerDirectoryItem[]>(`/identity-access/sellers?${params}`, { method: "GET", token: accessToken });
    return { sellers: envelope.data, pagination: envelope.meta?.pagination ?? fallbackPagination(query, envelope.data.length) };
  },

  async getInvitations(
    query: SellerInvitationsQuery,
    accessToken: string,
  ): Promise<SellerInvitationsResult> {
    const normalizedQuery: SellerInvitationsQuery = {
      page: 1,
      limit: 10,
      sortDirection: "desc",
      ...query,
    };

    const envelope = await httpEnvelope<SellerInvitation[]>(
      `/identity-access/sellers/invitations${buildSellerQueryString(normalizedQuery)}`,
      { method: "GET", token: accessToken },
    );

    return {
      invitations: envelope.data,
      pagination:
        envelope.meta?.pagination ??
        fallbackPagination(normalizedQuery, envelope.data.length),
    };
  },

  async getOverview(accessToken: string): Promise<SellerOverview> {
    const result = await this.getInvitations(
      { page: 1, limit: 100, sortDirection: "desc" },
      accessToken,
    );
    const count = (status: SellerInvitation["status"]) =>
      result.invitations.filter((invitation) => invitation.status === status)
        .length;

    return {
      total: result.pagination.total,
      pending: count("PENDIENTE"),
      activated: count("USADO"),
      expired: count("EXPIRADO"),
      revoked: count("REVOCADO"),
      isPartial: result.pagination.total > result.invitations.length,
    };
  },

  createInvitation(
    input: CreateSellerInvitationPayload,
    accessToken: string,
  ) {
    return http<SellerInvitationResponse>(
      "/identity-access/sellers/invitations",
      {
        method: "POST",
        token: accessToken,
        body: JSON.stringify(input),
      },
    );
  },

  resendAccessCode(email: string, accessToken: string) {
    return http<ResendSellerAccessCodeResponse>(
      "/identity-access/sellers/access-code/resend",
      {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ email }),
      },
    );
  },

  revokeInvitation(invitationId: string, accessToken: string) {
    return http<RevokeSellerInvitationResponse>(
      `/identity-access/sellers/invitations/${invitationId}/revoke`,
      { method: "PATCH", token: accessToken },
    );
  },

  deactivateSeller(sellerId: string, accessToken: string) {
    return http<SellerMutationResponse>(
      `/identity-access/sellers/${sellerId}/deactivate`,
      { method: "PATCH", token: accessToken },
    );
  },

  deleteSeller(sellerId: string, accessToken: string) {
    return http<SellerMutationResponse>(
      `/identity-access/sellers/${sellerId}`,
      { method: "DELETE", token: accessToken },
    );
  },

  adminResetPassword(input: AdminResetPasswordPayload, accessToken: string) {
    return http<AdminResetPasswordResponse>("/auth/password/reset/admin", {
      method: "POST",
      token: accessToken,
      body: JSON.stringify(input),
    });
  },
};
