"use client";

import { CalendarX, Radio, RefreshCw } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";
import { useActiveDrawShifts } from "../../hooks/use-draw-shifts";
import { useDrawClock } from "../../hooks/use-draw-clock";
import type { DrawShiftsQuery } from "../../types/draws.types";
import { DrawsSkeleton } from "../draws-skeleton";
import { DrawActiveShiftCard } from "./draw-active-shift-card";

type ActiveDrawShiftsGridProps = {
  query: Omit<DrawShiftsQuery, "status">;
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  canUpdate: boolean;
};

export function ActiveDrawShiftsGrid({
  query,
  basePath,
  params,
  canUpdate,
}: ActiveDrawShiftsGridProps) {
  const result = useActiveDrawShifts(query);
  const now = useDrawClock();
  const pagination = result.data?.pagination ?? {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    count: 0,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  if (result.isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <DrawsSkeleton className="h-80" />
        <DrawsSkeleton className="h-80" />
      </div>
    );
  }

  if (result.error) {
    return (
      <div role="alert" className="rounded-2xl border border-danger/25 bg-danger/10 p-6 text-sm text-danger">
        {result.error.message || "No fue posible cargar los turnos activos."}
      </div>
    );
  }

  const shifts = result.data?.shifts ?? [];

  if (shifts.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <div className="absolute inset-x-1/4 top-0 h-px bg-linear-to-r from-transparent via-foreground/25 to-transparent" />
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
          <CalendarX className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-sm font-medium text-foreground">No hay turnos en operación</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Cuando abras un turno aparecerá aquí con su cuenta regresiva, tiempo activo y controles operativos.
        </p>
      </div>
    );
  }

  return (
    <div className={result.isFetching ? "opacity-75 transition-opacity" : "transition-opacity"}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          Operación en vivo
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Sincronización automática
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {shifts.map((shift) => (
          <DrawActiveShiftCard
            key={shift.id}
            shift={shift}
            now={now}
            canUpdate={canUpdate}
          />
        ))}
      </div>

      <DataPagination
        pagination={pagination}
        basePath={basePath}
        params={params}
        itemLabel="turnos"
      />
    </div>
  );
}
