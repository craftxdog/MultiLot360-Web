import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";
import { drawKeys } from "../queries/draw.queries";
import { drawsApi } from "../server/draws-api";
import type { DrawsTab } from "../types/draws.types";
import { parseDrawWorkspaceQuery } from "../utils/draws-query";
import { DrawsView } from "./draws-view";

type DrawsPageProps = {
  defaultView: DrawsTab;
  requiredPermissions: readonly ("sorteos.read" | "turnos.read")[];
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function DrawsPage({
  defaultView,
  requiredPermissions,
  searchParams,
}: DrawsPageProps) {
  const user = await getCurrentUser();
  if (
    !user ||
    !requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    )
  ) {
    redirect(routes.dashboard);
  }

  const rawParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(rawParams).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
  });

  const query = parseDrawWorkspaceQuery(params, defaultView);
  const accessToken = await getAccessToken();
  const queryClient = getServerQueryClient();
  const canReadShifts = user.permissions.includes("turnos.read");
  const canReadConfigurations = user.permissions.includes("sorteos.read");
  const requests: Promise<unknown>[] = [];

  if (accessToken && canReadShifts && query.view === "active") {
    const activeQuery = {
      page: query.page,
      limit: query.limit,
      date: query.date,
      sortBy: "date" as const,
      sortDirection: "desc" as const,
    };
    requests.push(
      drawsApi.getActiveShifts(activeQuery, accessToken).then((value) => {
        queryClient.setQueryData(drawKeys.activeShiftList(activeQuery), value);
      }),
    );
  }

  if (accessToken && canReadShifts && query.view === "shifts") {
    const shiftsQuery = {
      page: query.page,
      limit: query.limit,
      date: query.date,
      status: query.status,
      sortBy: "date" as const,
      sortDirection: "desc" as const,
    };
    requests.push(
      drawsApi.getShifts(shiftsQuery, accessToken).then((value) => {
        queryClient.setQueryData(drawKeys.shiftList(shiftsQuery), value);
      }),
    );
  }

  if (accessToken && canReadConfigurations && query.view === "configurations") {
    const configurationsQuery = {
      page: query.page,
      limit: query.limit,
      active: query.active,
      sortBy: "time" as const,
      sortDirection: "asc" as const,
    };
    requests.push(
      drawsApi.getConfigurations(configurationsQuery, accessToken).then((value) => {
        queryClient.setQueryData(
          drawKeys.configurationList(configurationsQuery),
          value,
        );
      }),
    );
  }

  if (accessToken && canReadShifts && canReadConfigurations) {
    requests.push(
      drawsApi.getOverview(accessToken).then((value) => {
        queryClient.setQueryData(drawKeys.overview(), value);
      }),
    );
  }

  await Promise.allSettled(requests);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DrawsView defaultView={defaultView} />
    </HydrationBoundary>
  );
}
