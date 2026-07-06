import { z } from "zod";
import type {
  DrawConfigurationsQuery,
  DrawShiftsQuery,
  DrawWorkspaceQuery,
  DrawsTab,
} from "../types/draws.types";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const workspaceQuerySchema = z.object({
  view: z.enum(["active", "shifts", "configurations"]),
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  date: z.string().regex(dateRegex).optional().catch(undefined),
  status: z.enum(["ABIERTO", "BLOQUEO", "CERRADO"]).optional().catch(undefined),
  active: z.enum(["true", "false"]).optional().catch(undefined),
});

export function parseDrawWorkspaceQuery(
  params: URLSearchParams,
  defaultView: DrawsTab,
): DrawWorkspaceQuery {
  const parsed = workspaceQuerySchema.parse({
    view: params.get("view") ?? defaultView,
    page: params.get("page") ?? 1,
    limit: params.get("limit") ?? 10,
    date: params.get("date") || undefined,
    status: params.get("status") || undefined,
    active: params.get("active") || undefined,
  });

  return {
    view: parsed.view,
    page: parsed.page,
    limit: parsed.limit,
    date: parsed.date,
    status: parsed.status,
    active: parsed.active === undefined ? undefined : parsed.active === "true",
  };
}

export function buildDrawQueryString(
  query: DrawConfigurationsQuery | DrawShiftsQuery,
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const value = params.toString();
  return value ? `?${value}` : "";
}

export function buildDrawWorkspaceHref(
  basePath: string,
  query: DrawWorkspaceQuery,
  changes: Partial<DrawWorkspaceQuery>,
) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();

  if (next.view) params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.limit !== 10) params.set("limit", String(next.limit));
  if (next.date) params.set("date", next.date);
  if (next.status) params.set("status", next.status);
  if (next.active !== undefined) params.set("active", String(next.active));

  return `${basePath}?${params.toString()}`;
}
