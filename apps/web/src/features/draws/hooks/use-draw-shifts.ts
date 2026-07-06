import { useQuery } from "@tanstack/react-query";
import {
  activeDrawShiftsQueryOptions,
  drawOverviewQueryOptions,
  drawShiftsQueryOptions,
} from "../queries/draw.queries";
import type { DrawShiftsQuery } from "../types/draws.types";

export function useActiveDrawShifts(query: Omit<DrawShiftsQuery, "status"> = {}) {
  return useQuery(activeDrawShiftsQueryOptions(query));
}

export function useDrawShifts(query: DrawShiftsQuery = {}) {
  return useQuery(drawShiftsQueryOptions(query));
}

export function useDrawOverview() {
  return useQuery(drawOverviewQueryOptions());
}
