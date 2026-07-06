import { z } from "zod";
import type { BlockedNumbersQuery, NumberControlTab, NumberControlWorkspaceQuery, NumberLimitsQuery } from "../types/number-control.types";

const workspaceSchema = z.object({
  view: z.enum(["limits", "blocked"]),
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  number: z.string().regex(/^\d{2}$/).optional().catch(undefined),
  active: z.enum(["true", "false"]).optional().catch(undefined),
  sellerScope: z.enum(["GLOBAL", "SELLER"]).optional().catch(undefined),
  drawScope: z.enum(["DEFAULT", "DRAW"]).optional().catch(undefined),
  scope: z.enum(["DATE", "SHIFT"]).optional().catch(undefined),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
  drawCode: z.string().trim().max(80).optional().catch(undefined),
});

export function normalizeLotteryNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  return digits.length === 1 ? digits.padStart(2, "0") : digits;
}

export function parseNumberControlWorkspaceQuery(params: URLSearchParams, defaultView: NumberControlTab): NumberControlWorkspaceQuery {
  const parsed = workspaceSchema.parse({
    view: params.get("view") ?? defaultView,
    page: params.get("page") ?? 1,
    limit: params.get("limit") ?? 10,
    number: params.get("number") || undefined,
    active: params.get("active") || undefined,
    sellerScope: params.get("sellerScope") || undefined,
    drawScope: params.get("drawScope") || undefined,
    scope: params.get("scope") || undefined,
    date: params.get("date") || undefined,
    drawCode: params.get("drawCode") || undefined,
  });

  return { ...parsed, active: parsed.active === undefined ? undefined : parsed.active === "true" };
}

export function buildNumberControlQueryString(query: NumberLimitsQuery | BlockedNumbersQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function buildNumberControlWorkspaceHref(basePath: string, query: NumberControlWorkspaceQuery, changes: Partial<NumberControlWorkspaceQuery>) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.limit !== 10) params.set("limit", String(next.limit));
  if (next.number) params.set("number", next.number);
  if (next.active !== undefined) params.set("active", String(next.active));
  if (next.sellerScope) params.set("sellerScope", next.sellerScope);
  if (next.drawScope) params.set("drawScope", next.drawScope);
  if (next.scope) params.set("scope", next.scope);
  if (next.date) params.set("date", next.date);
  if (next.drawCode) params.set("drawCode", next.drawCode);
  return `${basePath}?${params.toString()}`;
}
