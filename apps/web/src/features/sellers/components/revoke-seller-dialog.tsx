"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSellerMutations } from "../hooks/use-seller-mutations";
import { useSellerWorkspaceStore } from "../store/seller-workspace.store";

export function RevokeSellerDialog() {
  const invitation = useSellerWorkspaceStore((state) => state.invitationToRevoke);
  const cancel = useSellerWorkspaceStore((state) => state.cancelRevoke);
  const clearSelectedInvitation = useSellerWorkspaceStore(
    (state) => state.clearSelectedInvitation,
  );
  const { revokeInvitation } = useSellerMutations();

  const confirm = async () => {
    if (!invitation) return;
    try {
      await revokeInvitation.mutateAsync(invitation.id);
      clearSelectedInvitation();
      cancel();
    } catch {
      // La mutación muestra el error y mantiene abierto el diálogo.
    }
  };

  return (
    <AnimatePresence>
      {invitation ? (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/55 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="revoke-title"
            className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
            initial={{ scale: 0.97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 8 }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h2 id="revoke-title" className="mt-4 text-base font-medium text-foreground">Revocar invitación</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {invitation.sellerName} ya no podrá usar el código enviado. Esta acción queda registrada por la API.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={cancel} disabled={revokeInvitation.isPending}>Conservar</Button>
              <Button variant="danger" onClick={confirm} disabled={revokeInvitation.isPending}>
                {revokeInvitation.isPending ? "Revocando..." : "Sí, revocar"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
