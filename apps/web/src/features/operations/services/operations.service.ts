import { browserHttp } from "@/lib/api/browser-http";
import type { AuditEvent, AuditQuery, CashCut, CashCutsQuery, CashCutSummary, OperationalReport, PageResult, PrizePayment, PrizePaymentsQuery, ReportQuery, Result, ResultsQuery, SellerOperationalReport, SellerReportsQuery, WinningSale, WinningSalesQuery } from "../types/operations.types";
import { queryString } from "../utils/operations-query";
const json = { "Content-Type": "application/json" };
export const operationsService = {
  results: (query: ResultsQuery) => browserHttp<PageResult<Result>>(`/api/operations/results${queryString(query)}`),
  createResult: (input: { shiftId: string; winningNumber: string }) => browserHttp<Result>("/api/operations/results", { method: "POST", headers: json, body: JSON.stringify(input) }),
  result: (id: string) => browserHttp<Result>(`/api/operations/results/${id}`),
  winningSales: (id: string, query: WinningSalesQuery) => browserHttp<PageResult<WinningSale>>(`/api/operations/results/${id}/winning-sales${queryString(query)}`),
  prizes: (query: PrizePaymentsQuery) => browserHttp<PageResult<PrizePayment>>(`/api/operations/prizes${queryString(query)}`),
  payPrize: (input: { resultId: string; saleId: string }) => browserHttp<PrizePayment>("/api/operations/prizes", { method: "POST", headers: json, body: JSON.stringify(input) }),
  prize: (saleId: string) => browserHttp<PrizePayment>(`/api/operations/prizes/${saleId}`),
  cuts: (query: CashCutsQuery) => browserHttp<PageResult<CashCut>>(`/api/operations/cuts${queryString(query)}`),
  createCut: (input: { startDate: string; endDate: string; description?: string; visibleToSellers?: boolean }) => browserHttp<CashCut>("/api/operations/cuts", { method: "POST", headers: json, body: JSON.stringify(input) }),
  cut: (id: string) => browserHttp<CashCut>(`/api/operations/cuts/${id}`),
  cutSummary: (id: string) => browserHttp<CashCutSummary>(`/api/operations/cuts/${id}/summary`),
  report: (query: ReportQuery) => browserHttp<OperationalReport>(`/api/operations/reports/overview${queryString(query)}`),
  sellerReports: (query: SellerReportsQuery) => browserHttp<PageResult<SellerOperationalReport>>(`/api/operations/reports/sellers${queryString(query)}`),
  audit: (query: AuditQuery) => browserHttp<PageResult<AuditEvent>>(`/api/operations/audit${queryString(query)}`),
  auditEvent: (id: string) => browserHttp<AuditEvent>(`/api/operations/audit/${id}`),
};
