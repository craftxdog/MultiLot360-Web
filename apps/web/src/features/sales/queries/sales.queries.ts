import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { salesService } from "../services/sales.service";
import type { SalesQuery } from "../types/sales.types";

export const salesKeys = {
  all: ["sales"] as const,
  lists: () => [...salesKeys.all, "list"] as const,
  list: (query: SalesQuery) => [...salesKeys.lists(), query] as const,
  detail: (saleId: string) => [...salesKeys.all, "detail", saleId] as const,
  overview: () => [...salesKeys.all, "overview"] as const,
  voidPolicy: () => [...salesKeys.all, "settings", "void-policy"] as const,
};

export function salesQueryOptions(query: SalesQuery) {
  return queryOptions({ queryKey: salesKeys.list(query), queryFn: () => salesService.getSales(query), placeholderData: keepPreviousData, staleTime: 8_000 });
}
export function saleQueryOptions(saleId: string) {
  return queryOptions({ queryKey: salesKeys.detail(saleId), queryFn: () => salesService.getSale(saleId), enabled: Boolean(saleId), staleTime: 10_000 });
}
export function salesOverviewQueryOptions() {
  return queryOptions({ queryKey: salesKeys.overview(), queryFn: () => salesService.getOverview(), staleTime: 15_000, refetchInterval: 30_000, refetchIntervalInBackground: false });
}
export function salesVoidPolicyQueryOptions(enabled = true) {
  return queryOptions({ queryKey: salesKeys.voidPolicy(), queryFn: () => salesService.getVoidPolicy(), enabled, staleTime: 60_000 });
}
