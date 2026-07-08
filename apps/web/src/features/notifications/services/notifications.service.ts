import { browserHttp } from "@/lib/api/browser-http";
import type { DeleteNotificationResult, MarkAllNotificationsReadResult, NotificationItem, NotificationsQuery, NotificationsResult, NotificationUnreadCount } from "../types/notification.types";
import { notificationQueryString } from "../utils/notification-query";

export const notificationsService = {
  list: (query: NotificationsQuery = {}) => browserHttp<NotificationsResult>(`/api/notifications${notificationQueryString(query)}`),
  unreadCount: () => browserHttp<NotificationUnreadCount>("/api/notifications/unread-count"),
  markRead: (id: string) => browserHttp<NotificationItem>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => browserHttp<MarkAllNotificationsReadResult>("/api/notifications/read-all", { method: "PATCH" }),
  delete: (id: string) => browserHttp<DeleteNotificationResult>(`/api/notifications/${id}`, { method: "DELETE" }),
};
