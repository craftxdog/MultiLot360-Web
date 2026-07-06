import { useQuery } from "@tanstack/react-query";
import { blockedNumberQueryOptions, blockedNumbersQueryOptions, numberControlOverviewQueryOptions, numberLimitQueryOptions, numberLimitsQueryOptions } from "../queries/number-control.queries";
import type { BlockedNumbersQuery, NumberLimitsQuery } from "../types/number-control.types";

export function useNumberLimits(query: NumberLimitsQuery) {
  return useQuery(numberLimitsQueryOptions(query));
}

export function useNumberLimit(limitId: string) {
  return useQuery(numberLimitQueryOptions(limitId));
}

export function useBlockedNumbers(query: BlockedNumbersQuery) {
  return useQuery(blockedNumbersQueryOptions(query));
}

export function useBlockedNumber(blockId: string) {
  return useQuery(blockedNumberQueryOptions(blockId));
}

export function useNumberControlOverview() {
  return useQuery(numberControlOverviewQueryOptions());
}
