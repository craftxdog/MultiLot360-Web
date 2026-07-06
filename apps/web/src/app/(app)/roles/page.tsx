import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AccessControlWorkspace } from "@/features/access-control/components/access-control-workspace";
import { accessControlApi } from "@/features/access-control/server/access-control-api";
import { accessKeys } from "@/features/access-control/queries/access-control.queries";
import { requirePagePermission } from "@/lib/auth/require-page-access";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";

export default async function RolesPage() { await requirePagePermission("roles.read"); const token = await getAccessToken(); const client = getServerQueryClient(); if (token) { const [modules, roles] = await Promise.allSettled([accessControlApi.modules(token), accessControlApi.roles(token)]); if (modules.status === "fulfilled") client.setQueryData(accessKeys.modules(), modules.value); if (roles.status === "fulfilled") client.setQueryData(accessKeys.roles(), roles.value); } return <HydrationBoundary state={dehydrate(client)}><AccessControlWorkspace /></HydrationBoundary>; }
