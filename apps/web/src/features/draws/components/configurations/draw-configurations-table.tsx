"use client";

import { Pencil, Settings2 } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";
import { useDrawConfigurations } from "../../hooks/use-draw-configurations";
import { useDrawsWorkspaceStore } from "../../store/draws-workspace.store";
import type { DrawConfigurationsQuery } from "../../types/draws.types";
import { formatDrawTime, formatSeconds } from "../../utils/draws-formatters";
import { DrawsSkeleton } from "../draws-skeleton";
import { DrawConfigurationStatusBadge } from "./draw-configuration-status-badge";

type DrawConfigurationsTableProps = {
  query: DrawConfigurationsQuery;
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  canUpdate: boolean;
};

export function DrawConfigurationsTable({
  query,
  basePath,
  params,
  canUpdate,
}: DrawConfigurationsTableProps) {
  const result = useDrawConfigurations(query);
  const openEditConfiguration = useDrawsWorkspaceStore(
    (state) => state.openEditConfiguration,
  );

  if (result.isLoading) return <DrawsSkeleton className="h-96" />;

  if (result.error) {
    return (
      <div role="alert" className="rounded-2xl border border-danger/25 bg-danger/10 p-6 text-sm text-danger">
        {result.error.message || "No se pudieron cargar las configuraciones."}
      </div>
    );
  }

  const configurations = result.data?.configurations ?? [];

  if (configurations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Settings2 className="mx-auto h-6 w-6 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-medium text-foreground">No hay configuraciones</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Crea una configuración para definir horarios y reglas de operación.
        </p>
      </div>
    );
  }

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
    <div className={result.isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 text-left font-medium">Configuración</th>
                <th className="px-5 py-3.5 text-left font-medium">Horario</th>
                <th className="px-5 py-3.5 text-left font-medium">Aplicación</th>
                <th className="px-5 py-3.5 text-left font-medium">Bloqueo</th>
                <th className="px-5 py-3.5 text-left font-medium">Reapertura</th>
                <th className="px-5 py-3.5 text-left font-medium">Estado</th>
                <th className="px-5 py-3.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((configuration) => (
                <tr key={configuration.id} className="border-b border-border last:border-0 hover:bg-accent">
                  <td className="px-5 py-4 font-medium text-foreground">{configuration.code}</td>
                  <td className="px-5 py-4 tabular-nums text-foreground">{formatDrawTime(configuration.time)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{configuration.tuesdayOnly ? "Solo martes" : "Todos los días"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatSeconds(configuration.lockSecondsBefore)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatSeconds(configuration.reopenSecondsAfter)}</td>
                  <td className="px-5 py-4"><DrawConfigurationStatusBadge active={configuration.active} /></td>
                  <td className="px-5 py-4 text-right">
                    {canUpdate ? (
                      <button
                        type="button"
                        onClick={() => openEditConfiguration(configuration.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {configurations.map((configuration) => (
          <article key={configuration.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{configuration.code}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDrawTime(configuration.time)} · {configuration.tuesdayOnly ? "Solo martes" : "Todos los días"}</p>
              </div>
              <DrawConfigurationStatusBadge active={configuration.active} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div><dt className="text-muted-foreground">Bloqueo</dt><dd className="mt-1 text-foreground">{formatSeconds(configuration.lockSecondsBefore)}</dd></div>
              <div><dt className="text-muted-foreground">Reapertura</dt><dd className="mt-1 text-foreground">{formatSeconds(configuration.reopenSecondsAfter)}</dd></div>
            </dl>
            {canUpdate ? (
              <button type="button" onClick={() => openEditConfiguration(configuration.id)} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs text-foreground">
                <Pencil className="h-3.5 w-3.5" /> Editar configuración
              </button>
            ) : null}
          </article>
        ))}
      </div>

      <DataPagination pagination={pagination} basePath={basePath} params={params} itemLabel="configuraciones" />
    </div>
  );
}
