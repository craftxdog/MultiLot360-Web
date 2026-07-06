"use client";

import { Grid, Willow, type ICellProps, type IColumnConfig } from "@svar-ui/react-grid";
import { Inbox } from "lucide-react";
import { SellerInvitationActions } from "./seller-invitation-actions";
import { SellerStatusBadge } from "./seller-status-badge";
import type { SellerInvitation } from "../types/seller.types";
import { formatSellerDate, getSellerInitials } from "../utils/seller-formatters";

type SellerInvitationGridRow = SellerInvitation & {
  expiresLabel: string;
  createdLabel: string;
};

function SellerCell({ row }: ICellProps) {
  const seller = row as unknown as SellerInvitationGridRow;

  return (
    <div className="flex min-w-0 items-center gap-3 py-1">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[11px] font-medium text-foreground">
        {getSellerInitials(seller.sellerName)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {seller.sellerName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          @{seller.username}
        </span>
      </span>
    </div>
  );
}

function StatusCell({ row }: ICellProps) {
  const seller = row as unknown as SellerInvitationGridRow;

  return <SellerStatusBadge status={seller.status} />;
}

function EmailCell({ row }: ICellProps) {
  const seller = row as unknown as SellerInvitationGridRow;

  return (
    <span className="block truncate text-sm text-foreground" title={seller.email}>
      {seller.email}
    </span>
  );
}

function DocumentCell({ row }: ICellProps) {
  const seller = row as unknown as SellerInvitationGridRow;

  return (
    <span className="whitespace-nowrap text-sm tabular-nums text-foreground">
      {seller.documentId}
    </span>
  );
}

function ExpirationCell({ row }: ICellProps) {
  const seller = row as unknown as SellerInvitationGridRow;

  return (
    <span className="whitespace-nowrap text-sm text-muted-foreground">
      {seller.expiresLabel}
    </span>
  );
}

function ActionsCell({ row }: ICellProps) {
  const seller = row as unknown as SellerInvitationGridRow;

  return <SellerInvitationActions invitation={seller} compact />;
}

const columns: IColumnConfig[] = [
  { id: "sellerName", header: "Vendedor", width: 220, flexgrow: 1.15, sort: true, cell: SellerCell },
  { id: "email", header: "Correo", width: 240, flexgrow: 1.35, sort: true, cell: EmailCell },
  { id: "documentId", header: "Documento", width: 170, flexgrow: 0.65, sort: true, cell: DocumentCell },
  { id: "status", header: "Estado", width: 130, sort: true, cell: StatusCell },
  { id: "expiresAt", header: "Vencimiento", width: 190, flexgrow: 0.75, sort: true, cell: ExpirationCell },
  { id: "actions", header: "Acciones", width: 154, cell: ActionsCell },
];

export function SellerInvitationsTable({
  invitations,
}: {
  invitations: SellerInvitation[];
}) {
  if (invitations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
        <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-foreground">
          No hay invitaciones con estos filtros
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Ajusta la búsqueda o invita al primer vendedor del equipo.
        </p>
      </div>
    );
  }

  const rows: SellerInvitationGridRow[] = invitations.map((invitation) => ({
    ...invitation,
    expiresLabel: formatSellerDate(invitation.expiresAt),
    createdLabel: formatSellerDate(invitation.createdAt),
  }));

  return (
    <>
      <div className="seller-grid hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
        <div className="min-w-[1104px]">
          <Willow fonts={false}>
            <Grid
              data={rows}
              columns={columns}
              sizes={{ rowHeight: 64, headerHeight: 44 }}
              select={false}
            />
          </Willow>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((invitation) => (
          <article
            key={invitation.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {invitation.sellerName}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {invitation.email}
                </p>
              </div>
              <SellerStatusBadge status={invitation.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Documento</dt>
                <dd className="mt-1 text-foreground">{invitation.documentId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Vence</dt>
                <dd className="mt-1 text-foreground">{invitation.expiresLabel}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-border pt-3">
              <SellerInvitationActions invitation={invitation} compact />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
