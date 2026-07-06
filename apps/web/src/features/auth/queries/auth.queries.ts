import { queryOptions } from "@tanstack/react-query";
import { browserHttp } from "@/lib/api/browser-http";
import type { AuthUser } from "../types/auth.types";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current-user"] as const,
};

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: authKeys.currentUser(),
    queryFn: () => browserHttp<AuthUser>("/api/auth/session"),
    staleTime: 2 * 60 * 1000,
  });
}
