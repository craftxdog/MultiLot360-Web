"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { buildDrawWorkspaceHref, parseDrawWorkspaceQuery } from "../utils/draws-query";
import type { DrawsTab, DrawWorkspaceQuery } from "../types/draws.types";
import { DrawConfigurationDrawer } from "./configurations/draw-configuration-drawer";
import { DrawConfigurationsTable } from "./configurations/draw-configurations-table";
import { DrawStatsCards } from "./draw-stats-cards";
import { DrawsHeader } from "./draws-header";
import { DrawsSmoothTabs } from "./draws-smooth-tabs";
import { DrawsToolbar } from "./draws-toolbar";
import { ActiveDrawShiftsGrid } from "./shifts/active-draw-shifts-grid";
import { DrawShiftActionDialog } from "./shifts/draw-shift-action-dialog";
import { DrawShiftDrawer } from "./shifts/draw-shift-drawer";
import { DrawShiftsGrid } from "./shifts/draw-shifts-grid";

type DrawsViewProps = {
  defaultView: DrawsTab;
};

const allTabs = [
  { label: "Activos", value: "active" as const, permission: "turnos.read" },
  { label: "Historial", value: "shifts" as const, permission: "turnos.read" },
  { label: "Configuraciones", value: "configurations" as const, permission: "sorteos.read" },
];

export function DrawsView({ defaultView }: DrawsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const query = useMemo(
    () => parseDrawWorkspaceQuery(new URLSearchParams(searchParams.toString()), defaultView),
    [defaultView, searchParams],
  );
  const permissions = currentUser.data?.permissions ?? [];
  const tabs = allTabs.filter((tab) => permissions.includes(tab.permission));
  const activeTab = tabs.some((tab) => tab.value === query.view)
    ? query.view
    : (tabs[0]?.value ?? defaultView);
  const effectiveQuery = activeTab === query.view ? query : { ...query, view: activeTab };

  function updateQuery(changes: Partial<DrawWorkspaceQuery>) {
    router.replace(
      buildDrawWorkspaceHref(pathname, effectiveQuery, { page: 1, ...changes }),
      { scroll: false },
    );
  }

  const sharedParams = {
    view: activeTab,
    limit: effectiveQuery.limit === 10 ? undefined : effectiveQuery.limit,
    date: effectiveQuery.date,
    status: activeTab === "shifts" ? effectiveQuery.status : undefined,
    active:
      activeTab === "configurations" && effectiveQuery.active !== undefined
        ? String(effectiveQuery.active)
        : undefined,
  };
  const canReadConfigurations = permissions.includes("sorteos.read");
  const canReadShifts = permissions.includes("turnos.read");
  const canCreateConfiguration = permissions.includes("sorteos.create");
  const canUpdateConfiguration = permissions.includes("sorteos.update");
  const canDeleteConfiguration = permissions.includes("sorteos.delete");
  const canCreateShift =
    permissions.includes("turnos.create") && canReadConfigurations;
  const canUpdateShift = permissions.includes("turnos.update");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DrawsHeader
        canCreateConfiguration={canCreateConfiguration}
        canCreateShift={canCreateShift}
      />

      {canReadConfigurations && canReadShifts ? <DrawStatsCards /> : null}

      <section className="rounded-2xl border border-border bg-card/85 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.035)] backdrop-blur-sm" aria-label="Operación de turnos">
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <DrawsSmoothTabs
            value={activeTab}
            onChange={(view) => updateQuery({ view, date: undefined, status: undefined, active: undefined })}
            options={tabs.map(({ label, value }) => ({ label, value }))}
          />

          <DrawsToolbar
            tab={activeTab}
            date={effectiveQuery.date ?? ""}
            status={effectiveQuery.status ?? "ALL"}
            active={
              effectiveQuery.active === undefined
                ? "ALL"
                : effectiveQuery.active
                  ? "true"
                  : "false"
            }
            onDateChange={(date) => updateQuery({ date: date || undefined })}
            onStatusChange={(status) => updateQuery({ status: status === "ALL" ? undefined : status })}
            onActiveChange={(active) => updateQuery({ active: active === "ALL" ? undefined : active === "true" })}
          />
        </div>

        <div className="mt-5">
          {activeTab === "active" ? (
            <ActiveDrawShiftsGrid
              query={{
                page: effectiveQuery.page,
                limit: effectiveQuery.limit,
                date: effectiveQuery.date,
                sortBy: "date",
                sortDirection: "desc",
              }}
              basePath={pathname}
              params={sharedParams}
              canUpdate={canUpdateShift}
            />
          ) : null}

          {activeTab === "shifts" ? (
            <DrawShiftsGrid
              query={{
                page: effectiveQuery.page,
                limit: effectiveQuery.limit,
                date: effectiveQuery.date,
                status: effectiveQuery.status,
                sortBy: "date",
                sortDirection: "desc",
              }}
              basePath={pathname}
              params={sharedParams}
              canUpdate={canUpdateShift}
            />
          ) : null}

          {activeTab === "configurations" ? (
            <DrawConfigurationsTable
              query={{
                page: effectiveQuery.page,
                limit: effectiveQuery.limit,
                active: effectiveQuery.active,
                sortBy: "time",
                sortDirection: "asc",
              }}
              basePath={pathname}
              params={sharedParams}
              canUpdate={canUpdateConfiguration}
              canDelete={canDeleteConfiguration}
            />
          ) : null}
        </div>
      </section>

      {canCreateConfiguration || canUpdateConfiguration ? <DrawConfigurationDrawer /> : null}
      {canCreateShift ? <DrawShiftDrawer /> : null}
      {canUpdateShift ? <DrawShiftActionDialog /> : null}
    </div>
  );
}
