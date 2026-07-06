import { createApiClient } from "@multilot/api-client";
import { env } from "@/config/env";

const apiClient = createApiClient({
  baseUrl: env.apiUrl,
  timeoutMs: 10_000,
});

export const http = apiClient.request;
export const httpEnvelope = apiClient.requestEnvelope;

export type {
  ApiEnvelope,
  ApiMeta,
  ApiPaginationMeta,
  ApiRequestOptions,
} from "@multilot/api-client";
export { ApiError } from "@multilot/api-client";
