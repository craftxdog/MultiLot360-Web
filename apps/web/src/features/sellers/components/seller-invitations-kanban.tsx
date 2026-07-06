"use client";

import { SellerInvitationActions } from "./seller-invitation-actions";
import { SellerStatusBadge } from "./seller-status-badge";
import type { SellerInvitation, SellerInvitationStatus } from "../types/seller.types";
import { formatSellerDate } from "../utils/seller-formatters";

const columns: Array<{
  status: SellerInvitationStatus;
  title: string;
  description: string;
}> = [
  { status: "PENDIENTE", title: "Pendientes", description: "Esperan activación" },
  { status: "USADO", title: "Activadas", description: "Acceso confirmado" },
  { status: "EXPIRADO", title: "Expiradas", description: "Código vencido" },
  { status: "REVOCADO", title: "Revocadas", description: "Acceso cancelado" },
];

export function SellerInvitationsKanban({
  invitations,
}: {
  invitations: SellerInvitation[];
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {columns.map((column) => {
        const items = invitations.filter((item) => item.status === column.status);

        return (
          <section
            key={column.status}
            className="min-h-80 rounded-2xl border border-border bg-background"
          >
            <header className="flex items-start justify-between border-b border-border p-3">
              <div>
                <h2 className="text-sm font-medium text-foreground">{column.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{column.description}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {items.length}
              </span>
            </header>

            <div className="space-y-3 p-3">
              {items.length === 0 ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  Sin invitaciones en esta página
                </p>
              ) : (
                items.map((invitation) => (
                  <article key={invitation.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
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
                    <p className="mt-4 text-xs text-muted-foreground">
                      Vence {formatSellerDate(invitation.expiresAt)}
                    </p>
                    <div className="mt-3 border-t border-border pt-3">
                      <SellerInvitationActions invitation={invitation} compact />
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
