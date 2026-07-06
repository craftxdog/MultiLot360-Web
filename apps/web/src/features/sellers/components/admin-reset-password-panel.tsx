"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminResetPasswordSchema } from "@/features/auth/schemas/password-reset.schema";
import { useSellerMutations } from "../hooks/use-seller-mutations";
import type { SellerInvitation } from "../types/seller.types";

export function AdminResetPasswordPanel({ invitation }: { invitation: SellerInvitation }) {
  const [open, setOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { resetPassword } = useSellerMutations();

  if (invitation.status !== "USADO") return null;

  return (
    <section className="mt-5 rounded-2xl border border-border p-4" aria-labelledby="admin-reset-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p id="admin-reset-title" className="text-sm font-medium">Seguridad de la cuenta</p>
          <p className="mt-1 text-xs text-muted-foreground">Restablece la contraseña sin correo y revoca sesiones de refresh anteriores.</p>
        </div>
        <Button variant="secondary" className="h-9 gap-2 px-3" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <KeyRound className="h-4 w-4" />Restablecer
        </Button>
      </div>

      {open ? (
        <form
          className="mt-4 space-y-3 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(formElement);
            const parsed = adminResetPasswordSchema.safeParse({
              targetUserId: invitation.userId,
              newPassword: form.get("newPassword"),
              confirmPassword: form.get("confirmPassword"),
            });

            if (!parsed.success) {
              setErrors(z.flattenError(parsed.error).fieldErrors);
              return;
            }

            setErrors({});
            resetPassword.mutate(parsed.data, {
              onSuccess: () => {
                formElement.reset();
                setShowPasswords(false);
                setOpen(false);
              },
            });
          }}
        >
          <div className="flex gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>La API exige rol ADMIN, módulo USUARIOS y permiso usuarios.update. La operación queda auditada.</p>
          </div>
          <div>
            <Label htmlFor={`admin-password-${invitation.id}`}>Nueva contraseña</Label>
            <div className="relative mt-2">
              <Input id={`admin-password-${invitation.id}`} name="newPassword" type={showPasswords ? "text" : "password"} minLength={8} maxLength={72} autoComplete="new-password" className="pr-11" aria-invalid={Boolean(errors.newPassword)} required />
              <button type="button" onClick={() => setShowPasswords((value) => !value)} aria-label={showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground">
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.newPassword?.[0]} />
          </div>
          <div>
            <Label htmlFor={`admin-confirm-${invitation.id}`}>Confirmación</Label>
            <Input id={`admin-confirm-${invitation.id}`} name="confirmPassword" type={showPasswords ? "text" : "password"} minLength={8} maxLength={72} autoComplete="new-password" className="mt-2" aria-invalid={Boolean(errors.confirmPassword)} required />
            <FieldError message={errors.confirmPassword?.[0]} />
          </div>
          <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? "Actualizando…" : "Confirmar restablecimiento"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
