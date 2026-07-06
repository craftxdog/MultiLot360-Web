"use client";

import { Inbox, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SystemParameter } from "../types/parameter.types";
import {
  formatParameterDate,
  formatParameterLabel,
  formatParameterNamespace,
} from "../utils/parameter-formatters";
import { useParameterWorkspaceStore } from "../store/parameter-workspace.store";
import { ParameterKindBadge } from "./parameter-kind-badge";

export function ParameterList({
  parameters,
  canUpdate,
}: {
  parameters: SystemParameter[];
  canUpdate: boolean;
}) {
  const openCreate = useParameterWorkspaceStore((state) => state.openCreate);
  const openEdit = useParameterWorkspaceStore((state) => state.openEdit);

  if (!parameters.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
        <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-foreground">
          No hay parámetros con esta búsqueda
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Ajusta el filtro o registra una nueva clave técnica para este entorno.
        </p>
        {canUpdate ? (
          <Button className="mt-5 gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo parámetro
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="hidden grid-cols-[minmax(260px,1.25fr)_minmax(220px,1fr)_130px_190px_44px] gap-4 border-b border-border bg-muted/55 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground lg:grid">
        <span>Parámetro</span>
        <span>Valor</span>
        <span>Tipo</span>
        <span>Actualización</span>
        <span className="sr-only">Acciones</span>
      </div>

      <div className="divide-y divide-border">
        {parameters.map((parameter) => (
          <article
            key={parameter.key}
            className="grid gap-4 px-4 py-4 transition hover:bg-accent/55 lg:grid-cols-[minmax(260px,1.25fr)_minmax(220px,1fr)_130px_190px_44px] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {formatParameterNamespace(parameter.key)}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {formatParameterLabel(parameter.key)}
                </span>
              </div>
              <code className="mt-1.5 block truncate text-[11px] text-muted-foreground">
                {parameter.key}
              </code>
            </div>

            <code
              className="block min-w-0 truncate rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
              title={parameter.value}
            >
              {parameter.value || "(vacío)"}
            </code>

            <div>
              <ParameterKindBadge value={parameter.value} />
            </div>

            <p className="text-xs text-muted-foreground">
              {formatParameterDate(parameter.updatedAt)}
            </p>

            {canUpdate ? (
              <button
                type="button"
                onClick={() => openEdit(parameter)}
                aria-label={`Editar ${parameter.key}`}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : (
              <span />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
