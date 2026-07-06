import { z } from "zod";
import type { SalesQuery, SalesTab, SalesWorkspaceQuery } from "../types/sales.types";

const workspaceSchema = z.object({
  view: z.enum(["sell", "history"]),
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  sellerId: z.uuid().optional().catch(undefined),
  shiftId: z.uuid().optional().catch(undefined),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
  drawCode: z.string().trim().max(80).optional().catch(undefined),
  number: z.string().regex(/^\d{2}$/).optional().catch(undefined),
  status: z.enum(["ACTIVA", "ANULADA"]).optional().catch(undefined),
});

export function normalizeSaleNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  return digits.length === 1 ? digits.padStart(2, "0") : digits;
}

export function parseSalesWorkspaceQuery(params: URLSearchParams, defaultView: SalesTab): SalesWorkspaceQuery {
  return workspaceSchema.parse({
    view: params.get("view") ?? defaultView,
    page: params.get("page") ?? 1,
    limit: params.get("limit") ?? 10,
    sellerId: params.get("sellerId") || undefined,
    shiftId: params.get("shiftId") || undefined,
    date: params.get("date") || undefined,
    drawCode: params.get("drawCode") || undefined,
    number: params.get("number") || undefined,
    status: params.get("status") || undefined,
  });
}

export function buildSalesQueryString(query: SalesQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function buildSalesWorkspaceHref(basePath: string, query: SalesWorkspaceQuery, changes: Partial<SalesWorkspaceQuery>) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.limit !== 10) params.set("limit", String(next.limit));
  if (next.sellerId) params.set("sellerId", next.sellerId);
  if (next.shiftId) params.set("shiftId", next.shiftId);
  if (next.date) params.set("date", next.date);
  if (next.drawCode) params.set("drawCode", next.drawCode);
  if (next.number) params.set("number", next.number);
  if (next.status) params.set("status", next.status);
  return `${basePath}?${params.toString()}`;
}
