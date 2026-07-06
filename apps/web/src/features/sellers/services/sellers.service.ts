import { browserHttp } from "@/lib/api/browser-http";
import { buildSellerQueryString } from "../utils/seller-query";
import type {
  CreateSellerInvitationPayload,
  ResendSellerAccessCodeResponse,
  RevokeSellerInvitationResponse,
  SellerInvitationResponse,
  SellerInvitationsQuery,
  SellerInvitationsResult,
  SellerOverview,
  SellerDirectoryQuery,
  SellerDirectoryResult,
  SellerMutationResponse,
} from "../types/seller.types";
import type { AdminResetPasswordPayload, AdminResetPasswordResponse } from "@/features/auth/types/auth.types";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const sellersService = {
  getDirectory(query: SellerDirectoryQuery = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); });
    const suffix = params.size ? `?${params}` : "";
    return browserHttp<SellerDirectoryResult>(`/api/sellers/directory${suffix}`);
  },

  getInvitations(query: SellerInvitationsQuery = {}) {
    return browserHttp<SellerInvitationsResult>(
      `/api/sellers/invitations${buildSellerQueryString(query)}`,
    );
  },

  getOverview() {
    return browserHttp<SellerOverview>("/api/sellers/invitations/overview");
  },

  createInvitation(input: CreateSellerInvitationPayload) {
    return browserHttp<SellerInvitationResponse>("/api/sellers/invitations", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
  },

  resendAccessCode(email: string) {
    return browserHttp<ResendSellerAccessCodeResponse>(
      "/api/sellers/access-code/resend",
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email }),
      },
    );
  },

  revokeInvitation(invitationId: string) {
    return browserHttp<RevokeSellerInvitationResponse>(
      `/api/sellers/invitations/${invitationId}/revoke`,
      { method: "PATCH" },
    );
  },

  deactivateSeller(sellerId: string) {
    return browserHttp<SellerMutationResponse>(`/api/sellers/${sellerId}/deactivate`, {
      method: "PATCH",
    });
  },

  deleteSeller(sellerId: string) {
    return browserHttp<SellerMutationResponse>(`/api/sellers/${sellerId}`, {
      method: "DELETE",
    });
  },

  adminResetPassword(input: AdminResetPasswordPayload) {
    return browserHttp<AdminResetPasswordResponse>("/api/sellers/password-reset", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
  },
};
