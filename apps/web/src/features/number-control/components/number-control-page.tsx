import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";
import { numberControlKeys } from "../queries/number-control.queries";
import { numberControlApi } from "../server/number-control-api";
import type { NumberControlTab } from "../types/number-control.types";
import { parseNumberControlWorkspaceQuery } from "../utils/number-control-query";
import { NumberControlView } from "./number-control-view";

export async function NumberControlPage({ defaultView, searchParams }: { defaultView: NumberControlTab; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const canReadLimits = user?.permissions.includes("limites_numero.read") ?? false;
  const canReadBlocked = user?.permissions.includes("numeros_bloqueados.read") ?? false;
  if (!user || (!canReadLimits && !canReadBlocked)) redirect(routes.dashboard);

  const raw = await searchParams;
  const params = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => typeof value === "string" && params.set(key, value));
  const query = parseNumberControlWorkspaceQuery(params, defaultView);
  const effectiveView = query.view === "limits" && canReadLimits ? "limits" : query.view === "blocked" && canReadBlocked ? "blocked" : canReadLimits ? "limits" : "blocked";
  const token = await getAccessToken();
  const queryClient = getServerQueryClient();
  const requests: Promise<unknown>[] = [];

  if (token && effectiveView === "limits") {
    const listQuery = { page: query.page, limit: query.limit, number: query.number, active: query.active, sellerScope: query.sellerScope, drawScope: query.drawScope, validOn: query.date, drawCode: query.drawCode, sortBy: "createdAt" as const, sortDirection: "desc" as const };
    requests.push(numberControlApi.getLimits(listQuery, token).then((value) => queryClient.setQueryData(numberControlKeys.limitList(listQuery), value)));
  }
  if (token && effectiveView === "blocked") {
    const listQuery = { page: query.page, limit: query.limit, number: query.number, scope: query.scope, date: query.date, drawCode: query.drawCode, sortBy: "createdAt" as const, sortDirection: "desc" as const };
    requests.push(numberControlApi.getBlockedNumbers(listQuery, token).then((value) => queryClient.setQueryData(numberControlKeys.blockedList(listQuery), value)));
  }
  if (token && canReadLimits && canReadBlocked) requests.push(numberControlApi.getOverview(token).then((value) => queryClient.setQueryData(numberControlKeys.overview(), value)));
  await Promise.allSettled(requests);

  return <HydrationBoundary state={dehydrate(queryClient)}><NumberControlView defaultView={effectiveView} /></HydrationBoundary>;
}
