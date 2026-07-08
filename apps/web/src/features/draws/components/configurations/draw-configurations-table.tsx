"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { useDrawConfigurations } from "../../hooks/use-draw-configurations";
import { useDrawConfigurationMutations } from "../../hooks/use-draw-configuration-mutations";
import { useDrawsWorkspaceStore } from "../../store/draws-workspace.store";
import { drawsService } from "../../services/draws.service";
import type { DrawConfiguration, DrawConfigurationsQuery } from "../../types/draws.types";
import { formatDrawTime, formatSeconds } from "../../utils/draws-formatters";
import { DrawsSkeleton } from "../draws-skeleton";
import { DrawConfigurationStatusBadge } from "./draw-configuration-status-badge";

type DrawConfigurationsTableProps = {
  query: DrawConfigurationsQuery;
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  canUpdate: boolean;
  canDelete: boolean;
};

const impactLabels = [
  ["shifts", "Turnos"],
  ["sales", "Ventas"],
  ["saleDetails", "Jugadas"],
  ["results", "Resultados"],
  ["prizePayments", "Premios pagados"],
  ["blockedNumbers", "Bloqueos"],
  ["numberLimits", "Límites"],
] as const;

export function DrawConfigurationsTable({
  query,
  basePath,
  params,
  canUpdate,
  canDelete,
}: DrawConfigurationsTableProps) {
  const result = useDrawConfigurations(query);
  const { softDeleteConfiguration, hardDeleteConfiguration } = useDrawConfigurationMutations();
  const [pendingDelete, setPendingDelete] = useState<DrawConfiguration | null>(null);
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard">("soft");
  const [reason, setReason] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const openEditConfiguration = useDrawsWorkspaceStore(
    (state) => state.openEditConfiguration,
  );
  const impact = useQuery({
    queryKey: ["draws", "configurations", "delete-impact", pendingDelete?.id],
    queryFn: () => drawsService.getConfigurationDeleteImpact(pendingDelete?.id ?? ""),
    enabled: Boolean(pendingDelete),
  });
  const deleting = softDeleteConfiguration.isPending || hardDeleteConfiguration.isPending;

  const openDelete = (configuration: DrawConfiguration) => {
    setPendingDelete(configuration);
    setDeleteMode("soft");
    setReason("");
    setAdminPassword("");
    setConfirmation("");
  };

  const closeDelete = () => {
    if (deleting) return;
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (deleteMode === "soft") {
      await softDeleteConfiguration.mutateAsync({ configurationId: pendingDelete.id, input: { reason: reason.trim() || undefined } });
    } else {
      await hardDeleteConfiguration.mutateAsync({
        configurationId: pendingDelete.id,
        input: {
          adminPassword,
          confirmation: "DELETE_DRAW_CONFIGURATION",
          reason: reason.trim() || undefined,
        },
      });
    }
    setPendingDelete(null);
  };

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
                  <td className="px-5 py-4 text-muted-foreground">{configuration.autoGenerateShifts ? (configuration.tuesdayOnly ? "Recurrente · martes" : "Recurrente diaria") : `Fecha única · ${configuration.singleDate ?? "sin fecha"}`}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatSeconds(configuration.lockSecondsBefore)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatSeconds(configuration.reopenSecondsAfter)}</td>
                  <td className="px-5 py-4"><DrawConfigurationStatusBadge active={configuration.active} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                    {canUpdate ? (
                      <button
                        type="button"
                        onClick={() => openEditConfiguration(configuration.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => openDelete(configuration)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger/25 px-2.5 text-xs text-danger transition hover:bg-danger/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    ) : null}
                    {!canUpdate && !canDelete ? (
                      <span className="text-xs text-muted-foreground">Solo lectura</span>
                    ) : null}
                    </div>
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
                <p className="mt-1 text-xs text-muted-foreground">{formatDrawTime(configuration.time)} · {configuration.autoGenerateShifts ? (configuration.tuesdayOnly ? "Recurrente martes" : "Recurrente diaria") : `Fecha única ${configuration.singleDate ?? ""}`}</p>
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
            {canDelete ? (
              <button type="button" onClick={() => openDelete(configuration)} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-danger/25 text-xs text-danger">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            ) : null}
          </article>
        ))}
      </div>

      <DataPagination pagination={pagination} basePath={basePath} params={params} itemLabel="configuraciones" />

      {pendingDelete ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeDelete()}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="draw-delete-title" className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-danger/10 text-danger"><AlertTriangle className="h-5 w-5" /></span>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Borrado controlado</p>
                <h2 id="draw-delete-title" className="mt-1 text-lg font-semibold text-foreground">Eliminar sorteo {pendingDelete.code}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Primero revisa el impacto. Usa baja lógica para conservar historial; el borrado físico exige contraseña admin y elimina dependencias en cascada controlada.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setDeleteMode("soft")} className={`rounded-2xl border p-4 text-left text-sm transition ${deleteMode === "soft" ? "border-primary bg-primary/5" : "border-border bg-background/60"}`}><span className="font-medium">Soft delete</span><span className="mt-1 block text-xs text-muted-foreground">Desactiva la configuración, no deja usarla y conserva historial.</span></button>
              <button type="button" onClick={() => setDeleteMode("hard")} className={`rounded-2xl border p-4 text-left text-sm transition ${deleteMode === "hard" ? "border-danger bg-danger/5" : "border-border bg-background/60"}`}><span className="font-medium">Hard delete</span><span className="mt-1 block text-xs text-muted-foreground">Irreversible. Requiere reautenticación y confirmación literal.</span></button>
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Impacto detectado</p>
              {impact.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Calculando impacto…</p> : impact.error ? <p className="mt-3 text-sm text-danger">{impact.error.message}</p> : impact.data ? <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {impactLabels.map(([key, label]) => <div key={key} className="rounded-xl border border-border p-3"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 font-mono text-lg">{impact.data.counts[key]}</dd></div>)}
              </dl> : null}
            </div>
            <label className="mt-5 block text-xs font-medium text-muted-foreground" htmlFor="draw-delete-reason">Motivo para auditoría</label>
            <textarea id="draw-delete-reason" value={reason} onChange={(event) => setReason(event.target.value.slice(0, 250))} className="mt-2 min-h-20 w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8" placeholder="Ej. Configuración duplicada creada por error." />
            {deleteMode === "hard" ? <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-muted-foreground" htmlFor="draw-admin-password">Contraseña admin</label><Input id="draw-admin-password" type="password" className="mt-2" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground" htmlFor="draw-confirmation">Escribe DELETE_DRAW_CONFIGURATION</label><Input id="draw-confirmation" className="mt-2 font-mono" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
            </div> : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={closeDelete} disabled={deleting}>Cancelar</Button>
              <Button variant={deleteMode === "hard" ? "danger" : "secondary"} onClick={confirmDelete} disabled={deleting || impact.isLoading || (deleteMode === "hard" && (!adminPassword || confirmation !== "DELETE_DRAW_CONFIGURATION"))}>{deleting ? "Procesando…" : deleteMode === "hard" ? "Eliminar definitivamente" : "Desactivar sorteo"}</Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
