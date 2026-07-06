import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";
import { salesKeys } from "../queries/sales.queries";
import { salesApi } from "../server/sales-api";
import type { SalesTab } from "../types/sales.types";
import { parseSalesWorkspaceQuery } from "../utils/sales-query";
import { SalesView } from "./sales-view";

export async function SalesPage({ defaultView, searchParams }: { defaultView: SalesTab; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const canRead = user?.permissions.includes("ventas.read") ?? false;
  const canCreate = user?.permissions.includes("ventas.create") ?? false;
  if (!user || (!canRead && !canCreate)) redirect(routes.dashboard);
  const raw = await searchParams;
  const params = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => typeof value === "string" && params.set(key, value));
  const query = parseSalesWorkspaceQuery(params, defaultView);
  const view = query.view === "sell" && canCreate ? "sell" : query.view === "history" && canRead ? "history" : canCreate ? "sell" : "history";
  const token = await getAccessToken();
  const client = getServerQueryClient();
  const requests: Promise<unknown>[] = [];
  if (token && canRead) requests.push(salesApi.getOverview(token).then((value) => client.setQueryData(salesKeys.overview(), value)));
  if (token && canRead && view === "history") {
    const listQuery = { page: query.page, limit: query.limit, sellerId: query.sellerId, shiftId: query.shiftId, date: query.date, drawCode: query.drawCode, number: query.number, status: query.status, sortBy: "createdAt" as const, sortDirection: "desc" as const };
    requests.push(salesApi.getSales(listQuery, token).then((value) => client.setQueryData(salesKeys.list(listQuery), value)));
  }
  if (token && user.role.name.toUpperCase() === "ADMIN" && user.permissions.includes("ventas.update")) requests.push(salesApi.getVoidPolicy(token).then((value) => client.setQueryData(salesKeys.voidPolicy(), value)));
  await Promise.allSettled(requests);
  return <HydrationBoundary state={dehydrate(client)}><SalesView defaultView={view} /></HydrationBoundary>;
}
