"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSellerMutations } from "../hooks/use-seller-mutations";
import type { SellerInvitation } from "../types/seller.types";

export function AdminResetPasswordPanel({ invitation }: { invitation: SellerInvitation }) {
  const [open, setOpen] = useState(false);
  const { resetPassword } = useSellerMutations();
  if (invitation.status !== "USADO") return null;

  return <div className="mt-5 rounded-2xl border border-border p-4">
    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Seguridad de la cuenta</p><p className="mt-1 text-xs text-muted-foreground">Restablece la contraseña y revoca sesiones anteriores.</p></div><Button variant="secondary" className="h-9 gap-2 px-3" onClick={() => setOpen((value) => !value)}><KeyRound className="h-4 w-4" />Restablecer</Button></div>
    {open ? <form className="mt-4 space-y-3 border-t border-border pt-4" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const newPassword = String(form.get("newPassword") ?? ""); const confirmPassword = String(form.get("confirmPassword") ?? ""); resetPassword.mutate({ targetUserId: invitation.userId, newPassword, confirmPassword }, { onSuccess: () => { event.currentTarget.reset(); setOpen(false); } }); }}><div><Label htmlFor={`admin-password-${invitation.id}`}>Nueva contraseña</Label><Input id={`admin-password-${invitation.id}`} name="newPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" className="mt-2" required /></div><div><Label htmlFor={`admin-confirm-${invitation.id}`}>Confirmación</Label><Input id={`admin-confirm-${invitation.id}`} name="confirmPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" className="mt-2" required /></div><Button type="submit" className="w-full" disabled={resetPassword.isPending}>{resetPassword.isPending ? "Actualizando..." : "Confirmar restablecimiento"}</Button></form> : null}
  </div>;
}
