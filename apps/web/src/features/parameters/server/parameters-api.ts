import "server-only";

import { http, httpEnvelope } from "@/lib/api/http";
import type {
  ParametersOverview,
  ParametersPagination,
  ParametersQuery,
  ParametersResult,
  SystemParameter,
  UpsertSystemParameterInput,
} from "../types/parameter.types";
import {
  countRecentParameters,
  getParameterNamespace,
} from "../utils/parameter-formatters";
import { buildParametersQueryString } from "../utils/parameter-query";

function fallbackPagination(
  query: Required<Pick<ParametersQuery, "page" | "limit">>,
  count: number,
): ParametersPagination {
  return {
    page: query.page,
    limit: query.limit,
    count,
    total: count,
    totalPages: count > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: query.page > 1,
  };
}

export const parametersApi = {
  async getParameters(
    query: ParametersQuery,
    accessToken: string,
  ): Promise<ParametersResult> {
    const normalized = {
      page: 1,
      limit: 20,
      sortBy: "key" as const,
      sortDirection: "asc" as const,
      ...query,
    };
    const envelope = await httpEnvelope<SystemParameter[]>(
      `/parameters${buildParametersQueryString(normalized)}`,
      { method: "GET", token: accessToken },
    );

    return {
      parameters: envelope.data,
      pagination:
        envelope.meta?.pagination ??
        fallbackPagination(normalized, envelope.data.length),
    };
  },

  getParameter(key: string, accessToken: string) {
    return http<SystemParameter>(`/parameters/${encodeURIComponent(key)}`, {
      method: "GET",
      token: accessToken,
    });
  },

  upsertParameter(
    input: UpsertSystemParameterInput,
    accessToken: string,
  ) {
    return http<SystemParameter>(
      `/parameters/${encodeURIComponent(input.key)}`,
      {
        method: "PUT",
        token: accessToken,
        body: JSON.stringify({ value: input.value }),
      },
    );
  },

  async getOverview(accessToken: string): Promise<ParametersOverview> {
    const result = await this.getParameters(
      {
        page: 1,
        limit: 100,
        sortBy: "updatedAt",
        sortDirection: "desc",
      },
      accessToken,
    );
    const namespaces = new Set(
      result.parameters.map((parameter) =>
        getParameterNamespace(parameter.key),
      ),
    );

    return {
      total: result.pagination.total,
      namespaces: namespaces.size,
      recentlyUpdated: countRecentParameters(result.parameters),
      isPartial: result.pagination.total > result.parameters.length,
    };
  },
};
