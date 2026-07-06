import { useQuery } from "@tanstack/react-query";
import {
  drawConfigurationQueryOptions,
  drawConfigurationsQueryOptions,
} from "../queries/draw.queries";
import type { DrawConfigurationsQuery } from "../types/draws.types";

export function useDrawConfigurations(query: DrawConfigurationsQuery = {}) {
  return useQuery(drawConfigurationsQueryOptions(query));
}

export function useDrawConfiguration(configurationId: string) {
  return useQuery(drawConfigurationQueryOptions(configurationId));
}
