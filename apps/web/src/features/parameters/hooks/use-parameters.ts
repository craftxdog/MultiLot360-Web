import { useQuery } from "@tanstack/react-query";
import {
  parameterDetailQueryOptions,
  parameterOverviewQueryOptions,
  parametersQueryOptions,
} from "../queries/parameter.queries";
import type { ParametersQuery } from "../types/parameter.types";

export function useParameters(query: ParametersQuery) {
  return useQuery(parametersQueryOptions(query));
}

export function useParameterOverview() {
  return useQuery(parameterOverviewQueryOptions());
}

export function useParameter(key: string) {
  return useQuery(parameterDetailQueryOptions(key));
}
