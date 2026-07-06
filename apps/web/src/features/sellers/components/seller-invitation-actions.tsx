"use client";

import { Eye, RefreshCcw, ShieldOff } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useSellerMutations } from "../hooks/use-seller-mutations";
import { useSellerWorkspaceStore } from "../store/seller-workspace.store";
import type { SellerInvitation } from "../types/seller.types";

type SellerInvitationActionsProps = {
  invitation: SellerInvitation;
  compact?: boolean;
  showDetails?: boolean;
};

export function SellerInvitationActions({
  invitation,
  compact = false,
  showDetails = true,
}: SellerInvitationActionsProps) {
  const selectInvitation = useSellerWorkspaceStore(
    (state) => state.selectInvitation,
  );
  const requestRevoke = useSellerWorkspaceStore((state) => state.requestRevoke);
  const { resendAccessCode } = useSellerMutations();
  const { data: currentUser } = useCurrentUser();
  const isPending = invitation.status === "PENDIENTE";
  const canCreate = currentUser?.permissions.includes("usuarios.create") ?? false;
  const canRevoke =
    currentUser?.permissions.some(
      (permission) =>
        permission === "usuarios.create" || permission === "usuarios.update",
    ) ?? false;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {showDetails ? (
        <button
          type="button"
          onClick={() => selectInvitation(invitation)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label={`Ver detalles de ${invitation.sellerName}`}
        >
          <Eye className="h-3.5 w-3.5" />
          {compact ? null : "Ver"}
        </button>
      ) : null}

      {canCreate ? (
        <button
          type="button"
          onClick={() => resendAccessCode.mutate(invitation.email)}
          disabled={!isPending || resendAccessCode.isPending}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
          aria-label={`Reenviar código a ${invitation.email}`}
        >
          <RefreshCcw
            className={`h-3.5 w-3.5 ${resendAccessCode.isPending ? "animate-spin" : ""}`}
          />
          {compact ? null : "Reenviar"}
        </button>
      ) : null}

      {canRevoke ? (
        <button
          type="button"
          onClick={() => requestRevoke(invitation)}
          disabled={!isPending}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-danger/20 px-2.5 text-xs text-danger transition hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-35"
          aria-label={`Revocar invitación de ${invitation.sellerName}`}
        >
          <ShieldOff className="h-3.5 w-3.5" />
          {compact ? null : "Revocar"}
        </button>
      ) : null}
    </div>
  );
}
