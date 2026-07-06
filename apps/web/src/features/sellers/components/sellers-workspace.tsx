"use client";

import { RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { DataPagination } from "@/components/ui/data-pagination";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { CreateSellerInvitationButton } from "./create-seller-invitation-button";
import { CreateSellerInvitationDrawer } from "./create-seller-invitation-drawer";
import { RevokeSellerDialog } from "./revoke-seller-dialog";
import { SellerDetailsDrawer } from "./seller-details-drawer";
import { SellerInvitationsFilters } from "./seller-invitations-filters";
import { SellerInvitationsKanban } from "./seller-invitations-kanban";
import { SellerInvitationsTable } from "./seller-invitations-table";
import { SellerOverviewCards } from "./seller-overview-cards";
import { SellerViewSwitcher } from "./seller-view-switcher";
import { useSellerInvitations } from "../hooks/use-sellers";
import { parseSellerInvitationsQuery } from "../utils/seller-query";

export function SellersWorkspace() {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const query = useMemo(
    () => parseSellerInvitationsQuery(new URLSearchParams(searchString)),
    [searchString],
  );
  const requestedView = searchParams.get("view");
  const view = requestedView === "flow" || requestedView === "kanban"
    ? "flow"
    : "directory";
  const { data, error, isFetching, refetch } = useSellerInvitations(query);
  const { data: currentUser } = useCurrentUser();
  const invitations = data?.invitations ?? [];
  const pagination = data?.pagination ?? {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    count: 0,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const baseParams = {
    email: query.email,
    username: query.username,
    sellerName: query.sellerName,
    status: query.status,
    view,
  };
  const canCreate = currentUser?.permissions.includes("usuarios.create") ?? false;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Equipo e identidad
          </div>
          <h1 className="text-2xl font-medium tracking-[-0.04em] text-foreground">Vendedores</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Un único espacio para consultar el equipo, acompañar activaciones y gobernar cada acceso operativo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SellerViewSwitcher view={view} baseParams={baseParams} />
          {canCreate ? <CreateSellerInvitationButton label="Nuevo acceso" /> : null}
        </div>
      </header>

      <section aria-label="Resumen de identidades y accesos" className="mt-6">
        <SellerOverviewCards />
      </section>

      <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary/12 bg-primary/4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Acceso sin contraseñas compartidas</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Cada vendedor activa su propia cuenta con un código temporal; reenviar invalida el código anterior.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground">
          Fuente: Identity Access API
        </span>
      </aside>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4" aria-label="Invitaciones de vendedores">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {view === "flow" ? "Flujo de activación" : "Directorio operativo"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {view === "flow"
                ? "Visualiza el avance de cada acceso por estado."
                : "Ordena columnas, abre el detalle o actúa sobre accesos pendientes."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        <SellerInvitationsFilters
          key={`${query.sellerName ?? ""}|${query.username ?? ""}|${query.email ?? ""}|${query.status ?? ""}`}
          query={query}
        />

        {error ? (
          <div role="alert" className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
            {error.message}
          </div>
        ) : null}

        <div className={`mt-4 transition-opacity ${isFetching ? "opacity-65" : "opacity-100"}`}>
          {view === "flow" ? (
            <SellerInvitationsKanban invitations={invitations} />
          ) : (
            <SellerInvitationsTable invitations={invitations} />
          )}
        </div>

        <DataPagination
          basePath="/vendedores"
          params={baseParams}
          pagination={pagination}
          itemLabel="accesos"
        />
      </section>

      {canCreate ? <CreateSellerInvitationDrawer /> : null}
      <SellerDetailsDrawer />
      <RevokeSellerDialog />
    </div>
  );
}
