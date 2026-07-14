"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import {
  initialPasswordResetState,
  passwordResetAction,
} from "../actions/password-reset.action";

type PasswordResetFormProps = {
  initialEmail?: string;
};

export function PasswordResetForm({ initialEmail = "" }: PasswordResetFormProps) {
  const normalizedInitialEmail = initialEmail.trim().toLowerCase();
  const [state, action, pending] = useActionState(passwordResetAction, {
    ...initialPasswordResetState,
    email: normalizedInitialEmail,
  });

  if (state.phase === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{state.message}</p>
        <Link href={routes.login} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-88">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="phase" value={state.phase} />
      {state.phase === "confirm" ? <input type="hidden" name="email" value={state.email} /> : null}
      <div className="rounded-xl border border-border bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
        {state.message ?? (state.phase === "request"
          ? "Usaremos el endpoint público de recuperación. Te enviaremos un código temporal y la respuesta nunca confirma si la cuenta existe."
          : `Escribe el código enviado a ${state.email}.`)}
      </div>

      {state.phase === "request" ? (
        <div><Label htmlFor="reset-email">Correo de la cuenta</Label><div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="reset-email" name="email" type="email" autoComplete="email" autoCapitalize="none" defaultValue={state.email} placeholder="nombre@empresa.com" className="pl-10" required /></div><FieldError message={state.errors?.email?.[0]} /></div>
      ) : (
        <>
          <div><Label htmlFor="reset-code">Código de recuperación</Label><div className="relative mt-2"><KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="reset-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="pl-10 font-mono tracking-[0.28em]" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 6); }} /></div><FieldError message={state.errors?.code?.[0]} /></div>
          <div><Label htmlFor="new-password">Nueva contraseña</Label><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" className="mt-2" /><FieldError message={state.errors?.newPassword?.[0]} /></div>
          <div><Label htmlFor="confirm-password">Confirmar contraseña</Label><Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" className="mt-2" /><FieldError message={state.errors?.confirmPassword?.[0]} /></div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Procesando..." : state.phase === "request" ? "Enviar código" : "Restablecer contraseña"}</Button>
      <Link href={routes.login} className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Volver al inicio de sesión</Link>
    </form>
  );
}
