import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { numberControlService } from "../services/number-control.service";
import type { BlockedNumbersQuery, NumberLimitsQuery } from "../types/number-control.types";

export const numberControlKeys = {
  all: ["number-control"] as const,
  limits: () => [...numberControlKeys.all, "limits"] as const,
  limitList: (query: NumberLimitsQuery) => [...numberControlKeys.limits(), "list", query] as const,
  limit: (limitId: string) => [...numberControlKeys.limits(), "detail", limitId] as const,
  blocked: () => [...numberControlKeys.all, "blocked"] as const,
  blockedList: (query: BlockedNumbersQuery) => [...numberControlKeys.blocked(), "list", query] as const,
  blockedDetail: (blockId: string) => [...numberControlKeys.blocked(), "detail", blockId] as const,
  overview: () => [...numberControlKeys.all, "overview"] as const,
};

export function numberLimitsQueryOptions(query: NumberLimitsQuery) {
  return queryOptions({
    queryKey: numberControlKeys.limitList(query),
    queryFn: () => numberControlService.getLimits(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function numberLimitQueryOptions(limitId: string) {
  return queryOptions({
    queryKey: numberControlKeys.limit(limitId),
    queryFn: () => numberControlService.getLimit(limitId),
    enabled: Boolean(limitId),
    staleTime: 15_000,
  });
}

export function blockedNumbersQueryOptions(query: BlockedNumbersQuery) {
  return queryOptions({
    queryKey: numberControlKeys.blockedList(query),
    queryFn: () => numberControlService.getBlockedNumbers(query),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}

export function blockedNumberQueryOptions(blockId: string) {
  return queryOptions({
    queryKey: numberControlKeys.blockedDetail(blockId),
    queryFn: () => numberControlService.getBlockedNumber(blockId),
    enabled: Boolean(blockId),
    staleTime: 10_000,
  });
}

export function numberControlOverviewQueryOptions() {
  return queryOptions({
    queryKey: numberControlKeys.overview(),
    queryFn: () => numberControlService.getOverview(),
    staleTime: 30_000,
  });
}
