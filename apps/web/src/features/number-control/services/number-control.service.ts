import { browserHttp } from "@/lib/api/browser-http";
import type {
  BlockedNumber,
  BlockedNumbersQuery,
  BlockedNumbersResult,
  CreateBlockedNumbersInput,
  CreateNumberLimitsInput,
  NumberControlOverview,
  NumberLimit,
  NumberLimitsQuery,
  NumberLimitsResult,
  UpdateNumberLimitInput,
} from "../types/number-control.types";
import { buildNumberControlQueryString } from "../utils/number-control-query";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const numberControlService = {
  getLimits(query: NumberLimitsQuery = {}) {
    return browserHttp<NumberLimitsResult>(`/api/number-control/limits${buildNumberControlQueryString(query)}`);
  },
  getLimit(limitId: string) {
    return browserHttp<NumberLimit>(`/api/number-control/limits/${limitId}`);
  },
  createLimits(input: CreateNumberLimitsInput) {
    return browserHttp<NumberLimit[]>("/api/number-control/limits", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(input) });
  },
  updateLimit(limitId: string, input: UpdateNumberLimitInput) {
    return browserHttp<NumberLimit>(`/api/number-control/limits/${limitId}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(input) });
  },
  expireLimit(limitId: string, expiresOn: string) {
    return browserHttp<NumberLimit>(`/api/number-control/limits/${limitId}/expire`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ expiresOn }) });
  },
  getBlockedNumbers(query: BlockedNumbersQuery = {}) {
    return browserHttp<BlockedNumbersResult>(`/api/number-control/blocked${buildNumberControlQueryString(query)}`);
  },
  getBlockedNumber(blockId: string) {
    return browserHttp<BlockedNumber>(`/api/number-control/blocked/${blockId}`);
  },
  createBlockedNumbers(input: CreateBlockedNumbersInput) {
    return browserHttp<BlockedNumber[]>("/api/number-control/blocked", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(input) });
  },
  deleteBlockedNumber(blockId: string) {
    return browserHttp<BlockedNumber>(`/api/number-control/blocked/${blockId}`, { method: "DELETE" });
  },
  getOverview() {
    return browserHttp<NumberControlOverview>("/api/number-control/overview");
  },
};
