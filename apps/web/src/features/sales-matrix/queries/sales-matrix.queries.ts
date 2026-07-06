import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { salesMatrixService } from "../services/sales-matrix.service";
import type { SalesMatrixQuery } from "../types/sales-matrix.types";

export const salesMatrixKeys = {
  all: ["sales-matrix"] as const,
  detail: (query: SalesMatrixQuery) => [...salesMatrixKeys.all, query] as const,
};

export function salesMatrixQueryOptions(query: SalesMatrixQuery) {
  return queryOptions({
    queryKey: salesMatrixKeys.detail(query),
    queryFn: () => salesMatrixService.get(query),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
}
