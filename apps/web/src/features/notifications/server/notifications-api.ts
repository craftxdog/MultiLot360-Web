import "server-only";

import { http, httpEnvelope } from "@/lib/api/http";
import type { ApiPaginationMeta } from "@/lib/api/http";
import type { NotificationItem, NotificationsResult, NotificationUnreadCount, MarkAllNotificationsReadResult } from "../types/notification.types";

function pagination(meta: ApiPaginationMeta | undefined, count: number): NotificationsResult["pagination"] {
  return meta ?? { page: 1, limit: 10, count, total: count, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
}

export const notificationsApi = {
  async list(accessToken: string) {
    const envelope = await httpEnvelope<NotificationItem[]>("/notifications?page=1&limit=10&sortBy=createdAt&sortDirection=desc", { method: "GET", token: accessToken });
    return { data: envelope.data, pagination: pagination(envelope.meta?.pagination, envelope.data.length) };
  },
  unreadCount: (accessToken: string) => http<NotificationUnreadCount>("/notifications/unread-count", { method: "GET", token: accessToken }),
  markRead: (notificationId: string, accessToken: string) => http<NotificationItem>(`/notifications/${notificationId}/read`, { method: "PATCH", token: accessToken }),
  markAllRead: (accessToken: string) => http<MarkAllNotificationsReadResult>("/notifications/read-all", { method: "PATCH", token: accessToken }),
};
