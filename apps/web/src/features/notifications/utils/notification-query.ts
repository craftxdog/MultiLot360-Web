import { z } from "zod";
import type { NotificationsQuery } from "../types/notification.types";

export const notificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(10),
  type: z.string().trim().max(80).optional().catch(undefined),
  unread: z.enum(["true", "false"]).optional().transform((value) => value === undefined ? undefined : value === "true"),
  sortBy: z.literal("createdAt").catch("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).catch("desc"),
});

export function notificationQueryString(query: NotificationsQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}
