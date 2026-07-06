import { z } from "zod";
import type { SalesMatrixQuery } from "../types/sales-matrix.types";

export function todayInManagua() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Managua",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const salesMatrixQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).catch(todayInManagua()),
  shiftId: z.uuid().optional().catch(undefined),
  drawCode: z.string().trim().toLowerCase().max(80).optional().catch(undefined),
  sellerId: z.uuid().optional().catch(undefined),
  status: z.enum(["ACTIVA", "ANULADA", "TODAS"]).catch("ACTIVA"),
});

export function parseSalesMatrixQuery(params: Pick<URLSearchParams, "get">): SalesMatrixQuery {
  return salesMatrixQuerySchema.parse({
    date: params.get("date") || todayInManagua(),
    shiftId: params.get("shiftId") || undefined,
    drawCode: params.get("drawCode") || undefined,
    sellerId: params.get("sellerId") || undefined,
    status: params.get("status") || "ACTIVA",
  });
}

export function buildSalesMatrixQueryString(query: SalesMatrixQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => value && params.set(key, String(value)));
  return `?${params.toString()}`;
}
