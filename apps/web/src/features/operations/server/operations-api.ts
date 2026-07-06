import "server-only";
import { http, httpEnvelope } from "@/lib/api/http";
import type { AuditEvent, AuditQuery, BusinessAnalyticsQuery, BusinessAnalyticsReport, CashCut, CashCutsQuery, CashCutSummary, OperationalReport, PrizePayment, PrizePaymentsQuery, ReportQuery, Result, ResultsQuery, SellerOperationalReport, SellerReportsQuery, WinningSale, WinningSalesQuery, PageResult, Pagination } from "../types/operations.types";
import { queryString } from "../utils/operations-query";
function page<T>(envelope: { data: T[]; meta?: { pagination?: Pagination } }, query: { page?: number; limit?: number }): PageResult<T> { return { data: envelope.data, pagination: envelope.meta?.pagination ?? { page: query.page ?? 1, limit: query.limit ?? 25, count: envelope.data.length, total: envelope.data.length, totalPages: envelope.data.length ? 1 : 0, hasNextPage: false, hasPreviousPage: false } }; }
export const operationsApi = {
  async results(query: ResultsQuery, token: string) { return page(await httpEnvelope<Result[]>(`/results${queryString(query)}`, { method: "GET", token }), query); },
  result(id: string, token: string) { return http<Result>(`/results/${id}`, { method: "GET", token }); },
  createResult(input: { shiftId: string; winningNumber: string }, token: string) { return http<Result>("/results", { method: "POST", token, body: JSON.stringify(input) }); },
  async winningSales(id: string, query: WinningSalesQuery, token: string) { return page(await httpEnvelope<WinningSale[]>(`/results/${id}/winning-sales${queryString(query)}`, { method: "GET", token }), query); },
  async prizes(query: PrizePaymentsQuery, token: string) { return page(await httpEnvelope<PrizePayment[]>(`/prize-payments${queryString(query)}`, { method: "GET", token }), query); },
  prize(saleId: string, token: string) { return http<PrizePayment>(`/prize-payments/${saleId}`, { method: "GET", token }); },
  payPrize(input: { resultId: string; saleId: string }, token: string) { return http<PrizePayment>("/prize-payments", { method: "POST", token, body: JSON.stringify(input) }); },
  async cuts(query: CashCutsQuery, token: string) { return page(await httpEnvelope<CashCut[]>(`/cash-cuts${queryString(query)}`, { method: "GET", token }), query); },
  cut(id: string, token: string) { return http<CashCut>(`/cash-cuts/${id}`, { method: "GET", token }); },
  createCut(input: { startDate: string; endDate: string; description?: string; visibleToSellers?: boolean }, token: string) { return http<CashCut>("/cash-cuts", { method: "POST", token, body: JSON.stringify(input) }); },
  cutSummary(id: string, token: string) { return http<CashCutSummary>(`/cash-cuts/${id}/summary`, { method: "GET", token }); },
  report(query: ReportQuery, token: string) { return http<OperationalReport>(`/reports/overview${queryString(query)}`, { method: "GET", token }); },
  analytics(query: BusinessAnalyticsQuery, token: string) { return http<BusinessAnalyticsReport>(`/reports/analytics${queryString(query)}`, { method: "GET", token }); },
  async sellerReports(query: SellerReportsQuery, token: string) { return page(await httpEnvelope<SellerOperationalReport[]>(`/reports/sellers${queryString(query)}`, { method: "GET", token }), query); },
  async audit(query: AuditQuery, token: string) { return page(await httpEnvelope<AuditEvent[]>(`/audit-events${queryString(query)}`, { method: "GET", token }), query); },
  auditEvent(id: string, token: string) { return http<AuditEvent>(`/audit-events/${id}`, { method: "GET", token }); },
};
