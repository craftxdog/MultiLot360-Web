import "server-only";

import { ApiError } from "@/lib/api/http";

export function getAuthErrorMessage(
  error: unknown,
  fallback: string,
  messages: Partial<Record<number, string>> = {},
) {
  if (error instanceof ApiError) {
    return messages[error.status] ?? error.message;
  }

  return fallback;
}
