import { browserHttp } from "@/lib/api/browser-http";
import type { NotificationItem, NotificationsResult, NotificationUnreadCount, MarkAllNotificationsReadResult } from "../types/notification.types";

export const notificationsService = {
  list: () => browserHttp<NotificationsResult>("/api/notifications"),
  unreadCount: () => browserHttp<NotificationUnreadCount>("/api/notifications/unread-count"),
  markRead: (id: string) => browserHttp<NotificationItem>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => browserHttp<MarkAllNotificationsReadResult>("/api/notifications/read-all", { method: "PATCH" }),
};
