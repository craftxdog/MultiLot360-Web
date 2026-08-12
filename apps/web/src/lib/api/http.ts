import { createApiClient } from "@multilot/api-client";
import { env } from "@/config/env";

async function tenantAwareFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (headers.has("Authorization") && !headers.has("x-tenant-id")) {
    const { getTenantSelector } = await import("@/lib/auth/session");
    const tenant = await getTenantSelector();
    if (tenant) headers.set("x-tenant-id", tenant);
  }

  return fetch(input, { ...init, headers });
}

const apiClient = createApiClient({
  baseUrl: env.apiUrl,
  timeoutMs: 10_000,
  fetcher: tenantAwareFetch,
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
