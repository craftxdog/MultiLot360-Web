"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DrawsDateField } from "./draws-date-field";
import { DrawsSelect } from "./draws-select";
import type { DrawShiftStatus, DrawsTab } from "../types/draws.types";

type DrawsToolbarProps = {
  tab: DrawsTab;
  date: string;
  status: DrawShiftStatus | "ALL";
  active: "ALL" | "true" | "false";
  onDateChange: (value: string) => void;
  onStatusChange: (value: DrawShiftStatus | "ALL") => void;
  onActiveChange: (value: "ALL" | "true" | "false") => void;
};

export function DrawsToolbar({
  tab,
  date,
  status,
  active,
  onDateChange,
  onStatusChange,
  onActiveChange,
}: DrawsToolbarProps) {
  const hasFilters = Boolean(date) || status !== "ALL" || active !== "ALL";

  function clearFilters() {
    onDateChange("");
    onStatusChange("ALL");
    onActiveChange("ALL");
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {(tab === "active" || tab === "shifts") && (
          <DrawsDateField
            value={date}
            onChange={onDateChange}
            className="w-full sm:w-[170px]"
          />
        )}

        {tab === "shifts" && (
          <DrawsSelect
            ariaLabel="Estado del turno"
            value={status}
            onChange={onStatusChange}
            className="w-full sm:w-[170px]"
            options={[
              { label: "Todos", value: "ALL" },
              { label: "Abierto", value: "ABIERTO" },
              { label: "Bloqueado", value: "BLOQUEO" },
              { label: "Cerrado", value: "CERRADO" },
            ]}
          />
        )}

        {tab === "configurations" && (
          <DrawsSelect
            ariaLabel="Estado de configuración"
            value={active}
            onChange={onActiveChange}
            className="w-full sm:w-[170px]"
            options={[
              { label: "Todas", value: "ALL" },
              { label: "Activas", value: "true" },
              { label: "Inactivas", value: "false" },
            ]}
          />
        )}

        {hasFilters ? (
          <Button variant="ghost" className="h-10 px-3" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        ) : null}
    </div>
  );
}
