"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "../actions/auth-action-state";
import { confirmSellerAccessAction } from "../actions/confirm-seller-access.action";
import { OtpCodeInput } from "./otp-code-input";

type SellerAccessFormProps = {
  next?: string;
  initialEmail?: string;
  initialAccessCode?: string;
  sanitizeActivationUrl?: boolean;
};

export function SellerAccessForm({
  next,
  initialEmail,
  initialAccessCode,
  sanitizeActivationUrl = false,
}: SellerAccessFormProps) {
  const [state, formAction, pending] = useActionState(
    confirmSellerAccessAction,
    initialAuthActionState,
  );

  useEffect(() => {
    if (!sanitizeActivationUrl || (!initialEmail && !initialAccessCode)) return;

    window.history.replaceState({}, "", window.location.pathname);
  }, [initialAccessCode, initialEmail, sanitizeActivationUrl]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-foreground">Activa tu acceso de vendedor</p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          Ingresa el correo de la invitación, el código de 6 dígitos y crea tu
          contraseña de vendedor.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {next ? <input name="next" type="hidden" value={next} /> : null}

        {state.message ? (
          <div
            role="alert"
            className="rounded-xl border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-5 text-danger"
          >
            {state.message}
          </div>
        ) : null}

        <div>
          <Label htmlFor="seller-email" className="sr-only">
            Correo electrónico
          </Label>
          <Input
            id="seller-email"
            name="email"
            type="email"
            placeholder="Correo de la invitación"
            autoComplete="email"
            defaultValue={initialEmail}
            disabled={pending}
            required
            aria-invalid={Boolean(state.errors?.email)}
            className="px-3.5"
          />
          <FieldError message={state.errors?.email} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Código de acceso</Label>
            <span className="text-xs text-muted-foreground">6 dígitos</span>
          </div>

          <OtpCodeInput
            name="accessCode"
            initialValue={initialAccessCode}
            disabled={pending}
            error={Boolean(state.errors?.accessCode)}
          />
          <FieldError message={state.errors?.accessCode} />
        </div>

        <div>
          <Label htmlFor="seller-password" className="sr-only">
            Contraseña
          </Label>
          <Input
            id="seller-password"
            name="password"
            type="password"
            placeholder="Crea una contraseña"
            autoComplete="new-password"
            disabled={pending}
            required
            aria-invalid={Boolean(state.errors?.password)}
            className="px-3.5"
          />
          <FieldError message={state.errors?.password} />
        </div>

        <div>
          <Label htmlFor="seller-confirm-password" className="sr-only">
            Confirmar contraseña
          </Label>
          <Input
            id="seller-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirma la contraseña"
            autoComplete="new-password"
            disabled={pending}
            required
            aria-invalid={Boolean(state.errors?.confirmPassword)}
            className="px-3.5"
          />
          <FieldError message={state.errors?.confirmPassword} />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full font-normal shadow-none"
        >
          {pending ? "Activando acceso..." : "Activar y entrar"}
        </Button>
      </form>
    </div>
  );
}
