import type { Pagination } from "@/features/operations/types/operations.types";

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResult = { data: NotificationItem[]; pagination: Pagination };
export type NotificationUnreadCount = { unread: number };
export type MarkAllNotificationsReadResult = { updatedCount: number; readAt: string };
