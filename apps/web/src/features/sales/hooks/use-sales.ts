import { useQuery } from "@tanstack/react-query";
import { saleQueryOptions, salesOverviewQueryOptions, salesQueryOptions, salesVoidPolicyQueryOptions } from "../queries/sales.queries";
import type { SalesQuery } from "../types/sales.types";

export function useSales(query: SalesQuery) { return useQuery(salesQueryOptions(query)); }
export function useSale(saleId: string) { return useQuery(saleQueryOptions(saleId)); }
export function useSalesOverview() { return useQuery(salesOverviewQueryOptions()); }
export function useSalesVoidPolicy(enabled = true) { return useQuery(salesVoidPolicyQueryOptions(enabled)); }
