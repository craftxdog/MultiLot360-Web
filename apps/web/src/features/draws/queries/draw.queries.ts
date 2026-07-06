import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { drawsService } from "../services/draws.service";
import type { DrawConfigurationsQuery, DrawShiftsQuery } from "../types/draws.types";

export const drawKeys = {
  all: ["draws"] as const,
  configurations: () => [...drawKeys.all, "configurations"] as const,
  configurationList: (query: DrawConfigurationsQuery) =>
    [...drawKeys.configurations(), "list", query] as const,
  configuration: (configurationId: string) =>
    [...drawKeys.configurations(), "detail", configurationId] as const,
  shifts: () => [...drawKeys.all, "shifts"] as const,
  shiftList: (query: DrawShiftsQuery) =>
    [...drawKeys.shifts(), "list", query] as const,
  activeShiftList: (query: Omit<DrawShiftsQuery, "status">) =>
    [...drawKeys.shifts(), "active", query] as const,
  overview: () => [...drawKeys.all, "overview"] as const,
};

export function drawConfigurationsQueryOptions(query: DrawConfigurationsQuery) {
  return queryOptions({
    queryKey: drawKeys.configurationList(query),
    queryFn: () => drawsService.getConfigurations(query),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });
}

export function drawConfigurationQueryOptions(configurationId: string) {
  return queryOptions({
    queryKey: drawKeys.configuration(configurationId),
    queryFn: () => drawsService.getConfiguration(configurationId),
    enabled: Boolean(configurationId),
    staleTime: 20_000,
  });
}

export function drawShiftsQueryOptions(query: DrawShiftsQuery) {
  return queryOptions({
    queryKey: drawKeys.shiftList(query),
    queryFn: () => drawsService.getShifts(query),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}

export function activeDrawShiftsQueryOptions(
  query: Omit<DrawShiftsQuery, "status">,
) {
  return queryOptions({
    queryKey: drawKeys.activeShiftList(query),
    queryFn: () => drawsService.getActiveShifts(query),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function drawOverviewQueryOptions() {
  return queryOptions({
    queryKey: drawKeys.overview(),
    queryFn: () => drawsService.getOverview(),
    staleTime: 30_000,
  });
}
