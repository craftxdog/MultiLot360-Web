import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParametersWorkspace } from "@/features/parameters/components/parameters-workspace";
import {
  parameterKeys,
  parameterOverviewQueryOptions,
} from "@/features/parameters/queries/parameter.queries";
import { parametersApi } from "@/features/parameters/server/parameters-api";
import { parseParametersQuery } from "@/features/parameters/utils/parameter-query";
import { getAccessToken } from "@/lib/auth/session";
import { getServerQueryClient } from "@/lib/query-server";
import { requirePagePermission } from "@/lib/auth/require-page-access";

type ParametersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ParametersPage({
  searchParams,
}: ParametersPageProps) {
  await requirePagePermission("parametros.read");
  const rawParams = await searchParams;
  const params = new URLSearchParams();

  Object.entries(rawParams).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
  });

  const query = parseParametersQuery(params);
  const accessToken = await getAccessToken();
  const queryClient = getServerQueryClient();

  if (accessToken) {
    const [parameters, overview] = await Promise.allSettled([
      parametersApi.getParameters(query, accessToken),
      parametersApi.getOverview(accessToken),
    ]);

    if (parameters.status === "fulfilled") {
      queryClient.setQueryData(parameterKeys.list(query), parameters.value);
    }

    if (overview.status === "fulfilled") {
      queryClient.setQueryData(
        parameterOverviewQueryOptions().queryKey,
        overview.value,
      );
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ParametersWorkspace />
    </HydrationBoundary>
  );
}
