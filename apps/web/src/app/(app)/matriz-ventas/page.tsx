import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { SalesMatrixWorkspace } from "@/features/sales-matrix/components/sales-matrix-workspace";
import { salesMatrixKeys } from "@/features/sales-matrix/queries/sales-matrix.queries";
import { salesMatrixApi } from "@/features/sales-matrix/server/sales-matrix-api";
import { parseSalesMatrixQuery } from "@/features/sales-matrix/utils/sales-matrix-query";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";

export const metadata: Metadata = { title: "Matriz de ventas | MultiLot 360" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user?.permissions.includes("matriz_ventas.read") || user.role.name.toUpperCase() !== "ADMIN") redirect(routes.dashboard);
  const raw = await searchParams;
  const params = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => typeof value === "string" && params.set(key, value));
  const query = parseSalesMatrixQuery(params);
  const token = await getAccessToken();
  const client = getServerQueryClient();
  if (token) await salesMatrixApi.get(query, token).then((data) => client.setQueryData(salesMatrixKeys.detail(query), data)).catch(() => undefined);
  return <HydrationBoundary state={dehydrate(client)}><SalesMatrixWorkspace /></HydrationBoundary>;
}
