import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { operationsService } from "../services/operations.service";
import type {
  AuditQuery,
  BusinessAnalyticsQuery,
  CashCutsQuery,
  PrizePaymentsQuery,
  ReportQuery,
  ResultsQuery,
  SellerReportsQuery,
  WinningSalesQuery,
} from "../types/operations.types";

export const operationKeys = {
  results: ["results"] as const,
  result: (id: string) => ["results", "detail", id] as const,
  winningSales: (id: string, query: WinningSalesQuery) =>
    ["results", "winning-sales", id, query] as const,
  prizes: ["prize-payments"] as const,
  prize: (saleId: string) => ["prize-payments", "detail", saleId] as const,
  cuts: ["cash-cuts"] as const,
  cut: (id: string) => ["cash-cuts", "detail", id] as const,
  cutSummary: (id: string) => ["cash-cuts", "summary", id] as const,
  reports: ["reports"] as const,
  analytics: (query: BusinessAnalyticsQuery) => [...operationKeys.reports, "analytics", query] as const,
  audit: ["audit"] as const,
  auditEvent: (id: string) => ["audit", "detail", id] as const,
};

export const resultsOptions = (query: ResultsQuery) =>
  queryOptions({
    queryKey: [...operationKeys.results, query],
    queryFn: () => operationsService.results(query),
    placeholderData: keepPreviousData,
  });

export const resultOptions = (id: string) =>
  queryOptions({
    queryKey: operationKeys.result(id),
    queryFn: () => operationsService.result(id),
    enabled: Boolean(id),
  });

export const winningSalesOptions = (id: string, query: WinningSalesQuery) =>
  queryOptions({
    queryKey: operationKeys.winningSales(id, query),
    queryFn: () => operationsService.winningSales(id, query),
    enabled: Boolean(id),
  });

export const prizesOptions = (query: PrizePaymentsQuery) =>
  queryOptions({
    queryKey: [...operationKeys.prizes, query],
    queryFn: () => operationsService.prizes(query),
    placeholderData: keepPreviousData,
  });

export const prizeOptions = (saleId: string) =>
  queryOptions({
    queryKey: operationKeys.prize(saleId),
    queryFn: () => operationsService.prize(saleId),
    enabled: Boolean(saleId),
  });

export const cutsOptions = (query: CashCutsQuery) =>
  queryOptions({
    queryKey: [...operationKeys.cuts, query],
    queryFn: () => operationsService.cuts(query),
    placeholderData: keepPreviousData,
  });

export const cutOptions = (id: string) =>
  queryOptions({
    queryKey: operationKeys.cut(id),
    queryFn: () => operationsService.cut(id),
    enabled: Boolean(id),
  });

export const cutSummaryOptions = (id: string) =>
  queryOptions({
    queryKey: operationKeys.cutSummary(id),
    queryFn: () => operationsService.cutSummary(id),
    enabled: Boolean(id),
  });

export const reportOptions = (query: ReportQuery) =>
  queryOptions({
    queryKey: [...operationKeys.reports, "overview", query],
    queryFn: () => operationsService.report(query),
  });

export const analyticsOptions = (query: BusinessAnalyticsQuery) =>
  queryOptions({
    queryKey: operationKeys.analytics(query),
    queryFn: () => operationsService.analytics(query),
    staleTime: 30_000,
  });

export const sellerReportsOptions = (query: SellerReportsQuery) =>
  queryOptions({
    queryKey: [...operationKeys.reports, "sellers", query],
    queryFn: () => operationsService.sellerReports(query),
    placeholderData: keepPreviousData,
  });

export const auditOptions = (query: AuditQuery) =>
  queryOptions({
    queryKey: [...operationKeys.audit, query],
    queryFn: () => operationsService.audit(query),
    placeholderData: keepPreviousData,
  });

export const auditEventOptions = (id: string) =>
  queryOptions({
    queryKey: operationKeys.auditEvent(id),
    queryFn: () => operationsService.auditEvent(id),
    enabled: Boolean(id),
  });
