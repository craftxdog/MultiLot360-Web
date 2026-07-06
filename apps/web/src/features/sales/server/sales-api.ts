import "server-only";

import { http, httpEnvelope } from "@/lib/api/http";
import type { CreateSaleInput, Sale, SalesOverview, SalesPagination, SalesQuery, SalesResult, SalesVoidPolicy } from "../types/sales.types";
import { buildSalesQueryString } from "../utils/sales-query";
import { getSalesToday } from "../utils/sales-formatters";

function fallbackPagination(page: number, limit: number, count: number): SalesPagination {
  return { page, limit, count, total: count, totalPages: count ? 1 : 0, hasNextPage: false, hasPreviousPage: page > 1 };
}

export const salesApi = {
  async getSales(query: SalesQuery, token: string): Promise<SalesResult> {
    const normalized = { page: 1, limit: 10, sortBy: "createdAt" as const, sortDirection: "desc" as const, ...query };
    const envelope = await httpEnvelope<Sale[]>(`/sales${buildSalesQueryString(normalized)}`, { method: "GET", token });
    return { sales: envelope.data, pagination: envelope.meta?.pagination ?? fallbackPagination(normalized.page, normalized.limit, envelope.data.length) };
  },
  getSale(saleId: string, token: string) {
    return http<Sale>(`/sales/${saleId}`, { method: "GET", token });
  },
  createSale(input: CreateSaleInput, token: string) {
    return http<Sale>("/sales", { method: "POST", token, body: JSON.stringify(input) });
  },
  voidSale(saleId: string, reason: string, token: string) {
    return http<Sale>(`/sales/${saleId}/void`, { method: "PATCH", token, body: JSON.stringify({ reason }) });
  },
  getVoidPolicy(token: string) {
    return http<SalesVoidPolicy>("/sales/settings/void-policy", { method: "GET", token });
  },
  updateVoidPolicy(windowMinutes: number, token: string) {
    return http<SalesVoidPolicy>("/sales/settings/void-policy", { method: "PATCH", token, body: JSON.stringify({ windowMinutes }) });
  },
  async getOverview(token: string): Promise<SalesOverview> {
    const [total, today, active, voided] = await Promise.all([
      this.getSales({ page: 1, limit: 1 }, token),
      this.getSales({ page: 1, limit: 1, date: getSalesToday() }, token),
      this.getSales({ page: 1, limit: 1, status: "ACTIVA" }, token),
      this.getSales({ page: 1, limit: 1, status: "ANULADA" }, token),
    ]);
    return { total: total.pagination.total, today: today.pagination.total, active: active.pagination.total, voided: voided.pagination.total };
  },
};
