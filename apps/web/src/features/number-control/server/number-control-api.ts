import "server-only";

import { http, httpEnvelope } from "@/lib/api/http";
import type {
  BlockedNumber,
  BlockedNumbersQuery,
  BlockedNumbersResult,
  CreateBlockedNumbersInput,
  CreateNumberLimitsInput,
  NumberControlOverview,
  NumberControlPagination,
  NumberLimit,
  NumberLimitsQuery,
  NumberLimitsResult,
  UpdateNumberLimitInput,
} from "../types/number-control.types";
import { buildNumberControlQueryString } from "../utils/number-control-query";

function fallbackPagination(page: number, limit: number, count: number): NumberControlPagination {
  return {
    page,
    limit,
    count,
    total: count,
    totalPages: count > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  };
}

export const numberControlApi = {
  async getLimits(query: NumberLimitsQuery, accessToken: string): Promise<NumberLimitsResult> {
    const normalized = { page: 1, limit: 10, sortBy: "createdAt" as const, sortDirection: "desc" as const, ...query };
    const envelope = await httpEnvelope<NumberLimit[]>(
      `/number-limits${buildNumberControlQueryString(normalized)}`,
      { method: "GET", token: accessToken },
    );
    return {
      limits: envelope.data,
      pagination: envelope.meta?.pagination ?? fallbackPagination(normalized.page, normalized.limit, envelope.data.length),
    };
  },

  getLimit(limitId: string, accessToken: string) {
    return http<NumberLimit>(`/number-limits/${limitId}`, { method: "GET", token: accessToken });
  },

  createLimits(input: CreateNumberLimitsInput, accessToken: string) {
    return http<NumberLimit[]>("/number-limits", { method: "POST", token: accessToken, body: JSON.stringify(input) });
  },

  updateLimit(limitId: string, input: UpdateNumberLimitInput, accessToken: string) {
    return http<NumberLimit>(`/number-limits/${limitId}`, { method: "PATCH", token: accessToken, body: JSON.stringify(input) });
  },

  expireLimit(limitId: string, expiresOn: string, accessToken: string) {
    return http<NumberLimit>(`/number-limits/${limitId}/expire`, { method: "PATCH", token: accessToken, body: JSON.stringify({ expiresOn }) });
  },

  async getBlockedNumbers(query: BlockedNumbersQuery, accessToken: string): Promise<BlockedNumbersResult> {
    const normalized = { page: 1, limit: 10, sortBy: "createdAt" as const, sortDirection: "desc" as const, ...query };
    const envelope = await httpEnvelope<BlockedNumber[]>(
      `/blocked-numbers${buildNumberControlQueryString(normalized)}`,
      { method: "GET", token: accessToken },
    );
    return {
      blockedNumbers: envelope.data,
      pagination: envelope.meta?.pagination ?? fallbackPagination(normalized.page, normalized.limit, envelope.data.length),
    };
  },

  getBlockedNumber(blockId: string, accessToken: string) {
    return http<BlockedNumber>(`/blocked-numbers/${blockId}`, { method: "GET", token: accessToken });
  },

  createBlockedNumbers(input: CreateBlockedNumbersInput, accessToken: string) {
    return http<BlockedNumber[]>("/blocked-numbers", { method: "POST", token: accessToken, body: JSON.stringify(input) });
  },

  deleteBlockedNumber(blockId: string, accessToken: string) {
    return http<BlockedNumber>(`/blocked-numbers/${blockId}`, { method: "DELETE", token: accessToken });
  },

  async getOverview(accessToken: string): Promise<NumberControlOverview> {
    const [active, global, seller, blocked] = await Promise.all([
      this.getLimits({ page: 1, limit: 1, active: true }, accessToken),
      this.getLimits({ page: 1, limit: 1, active: true, sellerScope: "GLOBAL" }, accessToken),
      this.getLimits({ page: 1, limit: 1, active: true, sellerScope: "SELLER" }, accessToken),
      this.getBlockedNumbers({ page: 1, limit: 1 }, accessToken),
    ]);
    return {
      activeLimits: active.pagination.total,
      globalLimits: global.pagination.total,
      sellerLimits: seller.pagination.total,
      blockedNumbers: blocked.pagination.total,
    };
  },
};
