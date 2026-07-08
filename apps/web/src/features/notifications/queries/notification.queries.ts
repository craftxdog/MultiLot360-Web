import { queryOptions } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";
import type { NotificationsQuery } from "../types/notification.types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (query: NotificationsQuery = {}) => ["notifications", "list", query] as const,
  unread: () => ["notifications", "unread"] as const,
};

export const notificationsQueryOptions = (query: NotificationsQuery = {}) => queryOptions({ queryKey: notificationKeys.list(query), queryFn: () => notificationsService.list(query), staleTime: 15_000 });
export const notificationUnreadQueryOptions = () => queryOptions({ queryKey: notificationKeys.unread(), queryFn: notificationsService.unreadCount, staleTime: 15_000 });
