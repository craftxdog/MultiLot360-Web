import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined);
const uuid = z.uuid().optional().catch(undefined);
const base = { page: z.coerce.number().int().positive().catch(1), limit: z.coerce.number().int().min(1).max(100).catch(25), sortDirection: z.enum(["asc", "desc"]).catch("desc") };
export const resultsQuerySchema = z.object({ ...base, shiftId: uuid, date, drawCode: z.string().trim().toLowerCase().optional(), winningNumber: z.string().regex(/^\d{2}$/).optional(), createdByUserId: uuid, sortBy: z.enum(["createdAt", "winningNumber", "date", "drawCode"]).catch("createdAt") });
export const prizesQuerySchema = z.object({ ...base, resultId: uuid, saleId: uuid, sellerId: uuid, paidByUserId: uuid, date, drawCode: z.string().trim().toLowerCase().optional(), paidFrom: date, paidUntil: date, sortBy: z.enum(["paidAt", "paidAmountMiles", "sellerName", "drawCode"]).catch("paidAt") });
export const cutsQuerySchema = z.object({ ...base, startDate: date, endDate: date, visibleToSellers: z.enum(["true", "false"]).optional().transform((v) => v === undefined ? undefined : v === "true"), createdByUserId: uuid, sortBy: z.enum(["createdAt", "startDate", "endDate"]).catch("createdAt") });
export const auditQuerySchema = z.object({ ...base, userId: uuid, event: z.string().trim().max(160).optional(), createdFrom: date, createdUntil: date, sortBy: z.enum(["createdAt", "event", "id"]).catch("createdAt") });
export const reportsQuerySchema = z.object({ dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), dateUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), sellerId: uuid, drawCode: z.string().trim().toLowerCase().optional(), page: z.coerce.number().int().positive().catch(1), limit: z.coerce.number().int().min(1).max(100).catch(25), sortBy: z.enum(["sellerName", "netSalesMiles", "paidPrizesMiles", "balanceMiles"]).catch("sellerName"), sortDirection: z.enum(["asc", "desc"]).catch("asc") });
export const analyticsQuerySchema = reportsQuerySchema.extend({ topLimit: z.coerce.number().int().min(1).max(50).catch(10) });

export function queryString(query: Record<string, unknown>) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => value !== undefined && value !== "" && params.set(key, String(value))); return params.toString() ? `?${params}` : ""; }
export function parseSearch(schema: z.ZodType, params: URLSearchParams) { return schema.parse(Object.fromEntries(params)); }
export function defaultReportDates() { const now = new Date(); const value = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(now); return { dateFrom: value, dateUntil: value }; }
