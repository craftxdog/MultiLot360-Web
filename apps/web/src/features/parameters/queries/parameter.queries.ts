import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { parametersService } from "../services/parameters.service";
import type { ParametersQuery } from "../types/parameter.types";

export const parameterKeys = {
  all: ["parameters"] as const,
  lists: () => [...parameterKeys.all, "list"] as const,
  list: (query: ParametersQuery) => [...parameterKeys.lists(), query] as const,
  detail: (key: string) => [...parameterKeys.all, "detail", key] as const,
  overview: () => [...parameterKeys.all, "overview"] as const,
};

export function parametersQueryOptions(query: ParametersQuery) {
  return queryOptions({
    queryKey: parameterKeys.list(query),
    queryFn: () => parametersService.getParameters(query),
    placeholderData: keepPreviousData,
  });
}

export function parameterOverviewQueryOptions() {
  return queryOptions({
    queryKey: parameterKeys.overview(),
    queryFn: () => parametersService.getOverview(),
    staleTime: 30_000,
  });
}

export function parameterDetailQueryOptions(key: string) {
  return queryOptions({
    queryKey: parameterKeys.detail(key),
    queryFn: () => parametersService.getParameter(key),
  });
}
