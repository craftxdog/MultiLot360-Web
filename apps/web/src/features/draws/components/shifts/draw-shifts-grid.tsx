"use client";

import { useDrawShifts } from "../../hooks/use-draw-shifts";
import type { DrawShiftsQuery } from "../../types/draws.types";
import { DrawShiftsTable } from "./draw-shifts-table";

type DrawShiftsGridProps = {
  query: DrawShiftsQuery;
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  canUpdate: boolean;
};

export function DrawShiftsGrid({ query, basePath, params, canUpdate }: DrawShiftsGridProps) {
  const result = useDrawShifts(query);
  const pagination = result.data?.pagination ?? {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    count: 0,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return (
    <DrawShiftsTable
      shifts={result.data?.shifts ?? []}
      pagination={pagination}
      isLoading={result.isLoading}
      isFetching={result.isFetching}
      error={result.error}
      emptyTitle="No hay turnos registrados"
      emptyDescription="Ajusta los filtros o crea un turno desde una configuración activa."
      basePath={basePath}
      params={params}
      canUpdate={canUpdate}
    />
  );
}
