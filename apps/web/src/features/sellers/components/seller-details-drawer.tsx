"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Mail, UserRound, X } from "lucide-react";
import { useSellerWorkspaceStore } from "../store/seller-workspace.store";
import { formatSellerDate } from "../utils/seller-formatters";
import { SellerInvitationActions } from "./seller-invitation-actions";
import { SellerStatusBadge } from "./seller-status-badge";
import { AdminResetPasswordPanel } from "./admin-reset-password-panel";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canAdminResetPassword } from "@/lib/auth/permissions";

export function SellerDetailsDrawer() {
  const invitation = useSellerWorkspaceStore((state) => state.selectedInvitation);
  const close = useSellerWorkspaceStore((state) => state.clearSelectedInvitation);
  const currentUser = useCurrentUser();

  return (
    <AnimatePresence>
      {invitation ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar detalles"
            className="fixed inset-0 z-40 cursor-default bg-black/45"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-details-title"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-105 border-l border-border bg-background p-5 shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Invitación</p>
                <h2 id="seller-details-title" className="mt-2 text-lg font-medium text-foreground">
                  {invitation.sellerName}
                </h2>
              </div>
              <button type="button" onClick={close} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5"><SellerStatusBadge status={invitation.status} /></div>

            <dl className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div><dt className="text-xs text-muted-foreground">Correo</dt><dd className="mt-1 break-all text-foreground">{invitation.email}</dd></div>
              </div>
              <div className="flex gap-3">
                <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div><dt className="text-xs text-muted-foreground">Usuario y documento</dt><dd className="mt-1 text-foreground">@{invitation.username} · {invitation.documentId}</dd></div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div><dt className="text-xs text-muted-foreground">Vencimiento</dt><dd className="mt-1 text-foreground">{formatSellerDate(invitation.expiresAt)}</dd></div>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Creada por</p>
              <p className="mt-2 text-sm text-foreground">
                {invitation.createdBy?.name ?? invitation.createdBy?.username ?? "Sistema"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{formatSellerDate(invitation.createdAt)}</p>
            </div>

            {currentUser.data && canAdminResetPassword(currentUser.data) ? <AdminResetPasswordPanel invitation={invitation} /> : null}

            <div className="mt-5 border-t border-border pt-4">
              <SellerInvitationActions invitation={invitation} showDetails={false} />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
