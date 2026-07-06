import { queryOptions } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
  unread: () => ["notifications", "unread"] as const,
};

export const notificationsQueryOptions = () => queryOptions({ queryKey: notificationKeys.list(), queryFn: notificationsService.list, staleTime: 15_000 });
export const notificationUnreadQueryOptions = () => queryOptions({ queryKey: notificationKeys.unread(), queryFn: notificationsService.unreadCount, staleTime: 15_000 });
