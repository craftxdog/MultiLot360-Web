"use client";

import { Plus, RadioTower, RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useParameters } from "../hooks/use-parameters";
import { useParameterWorkspaceStore } from "../store/parameter-workspace.store";
import { parseParametersQuery } from "../utils/parameter-query";
import { ParameterEditorDrawer } from "./parameter-editor-drawer";
import { ParameterList } from "./parameter-list";
import { ParameterPresets } from "./parameter-presets";
import { ParameterSummaryCards } from "./parameter-summary-cards";
import { ParameterToolbar } from "./parameter-toolbar";

export function ParametersWorkspace() {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const query = useMemo(
    () => parseParametersQuery(new URLSearchParams(searchString)),
    [searchString],
  );
  const { data, error, isFetching, isLoading, refetch } = useParameters(query);
  const { data: currentUser } = useCurrentUser();
  const openCreate = useParameterWorkspaceStore((state) => state.openCreate);
  const parameters = data?.parameters ?? [];
  const pagination = data?.pagination ?? {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    count: 0,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const canUpdate =
    currentUser?.permissions.includes("parametros.update") ?? false;
  const paginationParams = {
    key: query.key,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Configuración central
          </div>
          <h1 className="text-2xl font-medium tracking-[-0.04em] text-foreground">
            Parámetros del sistema
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Cambia reglas comunes con controles guiados y lenguaje operativo.
            Si soporte necesita una clave exacta, el catálogo avanzado queda
            abajo con todos los detalles técnicos.
          </p>
        </div>
        {canUpdate ? (
          <Button
            className="h-10 w-full gap-2 rounded-xl px-4 sm:w-auto"
            onClick={() => openCreate()}
          >
            <Plus className="h-4 w-4" />
            Nuevo avanzado
          </Button>
        ) : null}
      </header>

      <ParameterPresets canUpdate={canUpdate} parameters={parameters} />

      <section aria-label="Estado de configuración" className="mt-6">
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Estado de configuración
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-[-0.03em] text-foreground">
            Resumen rápido
          </h2>
        </div>
        <ParameterSummaryCards />
      </section>

      <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary/12 bg-primary/4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <RadioTower className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Cambios publicados al instante
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Cuando guardas un valor, queda activo en la API y los módulos
              autorizados lo consumen desde los endpoints protegidos.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground">
          Sin eliminación en el API
        </span>
      </aside>

      <section
        className="mt-6 rounded-2xl border border-border bg-card p-4"
        aria-label="Catálogo de parámetros"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Catálogo avanzado
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Úsalo cuando necesites revisar claves, tipos inferidos o fechas
              de cambio. Para operación diaria, usa el panel guiado de arriba.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <RefreshCcw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
        </div>

        <ParameterToolbar
          key={`${query.key ?? ""}|${query.sortBy ?? "key"}|${query.sortDirection ?? "asc"}`}
          query={query}
        />

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger"
          >
            {error.message}
          </div>
        ) : null}

        <div
          className={`mt-4 transition-opacity ${isFetching ? "opacity-65" : "opacity-100"}`}
        >
          {isLoading ? (
            <div className="space-y-2" aria-label="Cargando parámetros">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : (
            <ParameterList parameters={parameters} canUpdate={canUpdate} />
          )}
        </div>

        <DataPagination
          basePath="/parametros"
          params={paginationParams}
          pagination={pagination}
          itemLabel="parámetros"
        />
      </section>

      {canUpdate ? <ParameterEditorDrawer /> : null}
    </div>
  );
}
