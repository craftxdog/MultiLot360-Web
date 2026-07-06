import { parametersQuerySchema } from "../schemas/parameter.schema";
import type { ParametersQuery } from "../types/parameter.types";

export function parseParametersQuery(params: URLSearchParams): ParametersQuery {
  const parsed = parametersQuerySchema.safeParse(Object.fromEntries(params));

  return parsed.success
    ? parsed.data
    : { page: 1, limit: 20, sortBy: "key", sortDirection: "asc" };
}

export function buildParametersQueryString(query: ParametersQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}
