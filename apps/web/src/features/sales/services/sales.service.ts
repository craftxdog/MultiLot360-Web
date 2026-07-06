import { browserHttp } from "@/lib/api/browser-http";
import type { CreateSaleInput, Sale, SalesOverview, SalesQuery, SalesResult, SalesVoidPolicy } from "../types/sales.types";
import { buildSalesQueryString } from "../utils/sales-query";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const salesService = {
  getSales(query: SalesQuery = {}) { return browserHttp<SalesResult>(`/api/sales${buildSalesQueryString(query)}`); },
  getSale(saleId: string) { return browserHttp<Sale>(`/api/sales/${saleId}`); },
  createSale(input: CreateSaleInput) { return browserHttp<Sale>("/api/sales", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(input) }); },
  voidSale(saleId: string, reason: string) { return browserHttp<Sale>(`/api/sales/${saleId}/void`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ reason }) }); },
  getVoidPolicy() { return browserHttp<SalesVoidPolicy>("/api/sales/settings/void-policy"); },
  updateVoidPolicy(windowMinutes: number) { return browserHttp<SalesVoidPolicy>("/api/sales/settings/void-policy", { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ windowMinutes }) }); },
  getOverview() { return browserHttp<SalesOverview>("/api/sales/overview"); },
};
