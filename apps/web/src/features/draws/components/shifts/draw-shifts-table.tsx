"use client";

import { Grid, Willow, type ICellProps, type IColumnConfig } from "@svar-ui/react-grid";
import { CalendarX } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";
import { DrawsSkeleton } from "../draws-skeleton";
import { formatDrawDate, formatDrawTime } from "../../utils/draws-formatters";
import type {
  DrawPagination,
  DrawShift,
  DrawShiftStatus,
} from "../../types/draws.types";
import { DrawShiftActionsCell } from "./draw-shift-actions-cell";
import { DrawShiftStatusBadge } from "./draw-shift-status-badge";

type DrawShiftGridRow = {
  id: string;
  date: string;
  configurationCode: string;
  configurationTime: string;
  status: DrawShiftStatus;
  canUpdate: boolean;
};

function StatusCell({ row }: ICellProps) {
  const shift = row as unknown as DrawShiftGridRow;
  return <DrawShiftStatusBadge status={shift.status} />;
}

function ActionsCell({ row }: ICellProps) {
  const shift = row as unknown as DrawShiftGridRow;
  return <DrawShiftActionsCell row={shift} canUpdate={shift.canUpdate} />;
}

const columns: IColumnConfig[] = [
  { id: "date", header: "Fecha", width: 180, flexgrow: 0.8 },
  { id: "configurationCode", header: "Sorteo", width: 260, flexgrow: 1.4 },
  { id: "configurationTime", header: "Hora", width: 130 },
  { id: "status", header: "Estado", width: 150, cell: StatusCell },
  { id: "actions", header: "Acciones", width: 210, cell: ActionsCell },
];

type DrawShiftsTableProps = {
  shifts: DrawShift[];
  pagination: DrawPagination;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  emptyTitle: string;
  emptyDescription: string;
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  canUpdate: boolean;
};

export function DrawShiftsTable({
  shifts,
  pagination,
  isLoading,
  isFetching,
  error,
  emptyTitle,
  emptyDescription,
  basePath,
  params,
  canUpdate,
}: DrawShiftsTableProps) {
  if (isLoading) return <DrawsSkeleton className="h-96" />;

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-danger/25 bg-danger/10 p-6 text-sm text-danger">
        {error.message || "No fue posible cargar los turnos."}
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <CalendarX className="mx-auto h-6 w-6 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-medium text-foreground">{emptyTitle}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const rows: DrawShiftGridRow[] = shifts.map((shift) => ({
    id: shift.id,
    date: formatDrawDate(shift.date),
    configurationCode: shift.configuration.code,
    configurationTime: formatDrawTime(shift.configuration.time),
    status: shift.status,
    canUpdate,
  }));

  return (
    <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
      <div className="draws-grid hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
        <div className="min-w-[930px]">
          <Willow fonts={false}>
            <Grid
              data={rows}
              columns={columns}
              sizes={{ rowHeight: 58, headerHeight: 44 }}
              select={false}
            />
          </Willow>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((shift) => (
          <article key={shift.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{shift.configurationCode}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {shift.date} · {shift.configurationTime}
                </p>
              </div>
              <DrawShiftStatusBadge status={shift.status} />
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <DrawShiftActionsCell row={shift} canUpdate={canUpdate} />
            </div>
          </article>
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
