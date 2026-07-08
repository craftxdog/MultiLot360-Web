import "server-only";

import { http, httpEnvelope } from "@/lib/api/http";
import type { ApiPaginationMeta } from "@/lib/api/http";
import type { DeleteNotificationResult, MarkAllNotificationsReadResult, NotificationItem, NotificationsQuery, NotificationsResult, NotificationUnreadCount } from "../types/notification.types";
import { notificationQueryString } from "../utils/notification-query";

function pagination(meta: ApiPaginationMeta | undefined, count: number): NotificationsResult["pagination"] {
  return meta ?? { page: 1, limit: 10, count, total: count, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
}

export const notificationsApi = {
  async list(query: NotificationsQuery, accessToken: string) {
    const normalized = { page: 1, limit: 10, sortBy: "createdAt" as const, sortDirection: "desc" as const, ...query };
    const envelope = await httpEnvelope<NotificationItem[]>(`/notifications${notificationQueryString(normalized)}`, { method: "GET", token: accessToken });
    return { data: envelope.data, pagination: pagination(envelope.meta?.pagination, envelope.data.length) };
  },
  unreadCount: (accessToken: string) => http<NotificationUnreadCount>("/notifications/unread-count", { method: "GET", token: accessToken }),
  markRead: (notificationId: string, accessToken: string) => http<NotificationItem>(`/notifications/${notificationId}/read`, { method: "PATCH", token: accessToken }),
  markAllRead: (accessToken: string) => http<MarkAllNotificationsReadResult>("/notifications/read-all", { method: "PATCH", token: accessToken }),
  delete: (notificationId: string, accessToken: string) => http<DeleteNotificationResult>(`/notifications/${notificationId}`, { method: "DELETE", token: accessToken }),
};
