"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, ShieldCheck, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminResetPasswordSchema } from "@/features/auth/schemas/password-reset.schema";
import { useSellerMutations } from "../hooks/use-seller-mutations";

export function AdminPasswordResetTool() {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { resetPassword } = useSellerMutations();

  return <>
    <Button variant="secondary" className="h-9 gap-2 px-3" onClick={() => setOpen(true)}>
      <KeyRound className="h-4 w-4" />
      <span className="hidden sm:inline">Restablecer clave</span>
      <span className="sm:hidden">Clave</span>
    </Button>
    <AnimatePresence>
      {open ? <>
        <motion.button type="button" aria-label="Cerrar restablecimiento administrativo" className="fixed inset-0 z-40 cursor-default bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
        <motion.aside role="dialog" aria-modal="true" aria-labelledby="admin-password-reset-title" className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <header className="flex items-start justify-between gap-4 border-b border-border p-5"><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Administración de identidad</p><h2 id="admin-password-reset-title" className="mt-2 text-lg font-medium">Restablecer contraseña</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-4 w-4" /></button></header>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(formElement);
            const parsed = adminResetPasswordSchema.safeParse({ targetUserId: form.get("targetUserId"), newPassword: form.get("newPassword"), confirmPassword: form.get("confirmPassword") });
            if (!parsed.success) { setErrors(z.flattenError(parsed.error).fieldErrors); return; }
            setErrors({});
            resetPassword.mutate(parsed.data, { onSuccess: () => { formElement.reset(); setOpen(false); } });
          }}>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p className="text-xs leading-5 text-muted-foreground">Usa el ID interno de <code>usuarios.id</code>. La API sólo permite cuentas activas enlazadas a Supabase, revoca sus sesiones de refresh y registra la operación en auditoría.</p></div>
              <div><Label htmlFor="admin-target-user">ID interno del usuario</Label><Input id="admin-target-user" name="targetUserId" placeholder="UUID de usuarios.id" className="mt-2 font-mono" aria-invalid={Boolean(errors.targetUserId)} required /><FieldError message={errors.targetUserId?.[0]} /></div>
              <div><Label htmlFor="admin-new-password">Nueva contraseña</Label><Input id="admin-new-password" name="newPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" className="mt-2" aria-invalid={Boolean(errors.newPassword)} required /><FieldError message={errors.newPassword?.[0]} /></div>
              <div><Label htmlFor="admin-confirm-password">Confirmación</Label><Input id="admin-confirm-password" name="confirmPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" className="mt-2" aria-invalid={Boolean(errors.confirmPassword)} required /><FieldError message={errors.confirmPassword?.[0]} /></div>
            </div>
            <footer className="flex justify-end gap-2 border-t border-border p-5"><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={resetPassword.isPending}>Cancelar</Button><Button type="submit" disabled={resetPassword.isPending}>{resetPassword.isPending ? "Actualizando…" : "Restablecer contraseña"}</Button></footer>
          </form>
        </motion.aside>
      </> : null}
    </AnimatePresence>
  </>;
}
