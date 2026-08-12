import "server-only";

import { apiEndpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import type {
  BankTransferInput,
  BillingChannel,
  BillingPlan,
  BillingPortal,
  ReviewTransferInput,
  ReviewTransferResult,
  TransferQueueItem,
  TransferStatus,
} from "../types/billing.types";

const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export const billingApi = {
  plans(channel: BillingChannel = "BANK_TRANSFER") {
    return http<BillingPlan[]>(
      `${apiEndpoints.billing.plans}${query({ channel })}`,
      { method: "GET" },
    );
  },

  portal(token: string) {
    return http<BillingPortal>(apiEndpoints.billing.portal, {
      method: "GET",
      token,
    });
  },

  ensureInitialInvoice(token: string) {
    return http<{ invoiceId: string }>(apiEndpoints.billing.initialInvoice, {
      method: "POST",
      token,
    });
  },

  paypalCheckout(token: string) {
    return http<{
      onboardingId: string;
      provider: "PAYPAL";
      providerSubscriptionId: string;
      approvalUrl: string;
    }>(apiEndpoints.billing.paypalCheckout, { method: "POST", token });
  },

  createTransfer(input: BankTransferInput, token: string) {
    return http<{ submissionId: string; state: "PENDIENTE_EVIDENCIA" }>(
      apiEndpoints.billing.transfers,
      { method: "POST", token, body: JSON.stringify(input) },
    );
  },

  uploadEvidence(submissionId: string, file: File, token: string) {
    const body = new FormData();
    body.set("file", file);
    return http<{
      evidenceId: string;
      submissionId: string;
      state: "EN_REVISION";
    }>(`${apiEndpoints.billing.transfers}/${submissionId}/evidence`, {
      method: "POST",
      token,
      body,
      timeoutMs: 30_000,
    });
  },

  transferQueue(status: TransferStatus, limit: number, token: string) {
    return http<TransferQueueItem[]>(
      `${apiEndpoints.billing.adminTransfers}${query({ status, limit })}`,
      { method: "GET", token },
    );
  },

  reviewTransfer(id: string, input: ReviewTransferInput, token: string) {
    return http<ReviewTransferResult>(
      `${apiEndpoints.billing.adminTransfers}/${id}/review`,
      { method: "POST", token, body: JSON.stringify(input) },
    );
  },
};
