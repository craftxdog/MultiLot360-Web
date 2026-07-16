"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useLayoutEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import {
  initialSellerAccessState,
  submitSellerAccess,
  type SellerAccessState,
} from "../services/seller-access.client";
import {
  cleanSellerActivationUrl,
  parseSellerActivationParams,
} from "../utils/seller-activation-url";
import { OtpCodeInput } from "./otp-code-input";

type SellerAccessFormProps = {
  next?: string;
  actionToken?: string;
  invalidToken?: boolean;
  initialEmail?: string;
  initialAccessCode?: string;
};

type SellerAccessFormViewProps = SellerAccessFormProps & {
  state: SellerAccessState;
  pending: boolean;
  manualMode: boolean;
  formAction?: (formData: FormData) => void;
  onUseManual?: () => void;
};

export function SellerAccessFormView({
  actionToken,
  invalidToken = false,
  initialEmail,
  initialAccessCode,
  state,
  pending,
  manualMode,
  formAction,
  onUseManual,
}: SellerAccessFormViewProps) {
  const tokenMode = Boolean(actionToken) && !manualMode;

  if (state.status === "success") {
    return (
      <div className="text-center" data-testid="seller-access-success">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{state.message}</p>
        <Link href={routes.login} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-foreground">Activa tu acceso de vendedor</p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {tokenMode
            ? "Crea tu contraseña para confirmar la invitación segura."
            : "Ingresa el correo, el código de 6 dígitos y crea tu contraseña."}
        </p>
      </div>

      {invalidToken ? (
        <div role="alert" className="rounded-xl border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-5 text-danger">
          El enlace no es válido. Usa el código manual o solicita un nuevo enlace a tu administrador.
        </div>
      ) : null}

      <form action={formAction} className="space-y-4" data-testid="seller-access-form">
        {state.message ? (
          <div role="alert" className="rounded-xl border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-5 text-danger">
            {state.message}
          </div>
        ) : null}

        {tokenMode ? (
          <div className="grid gap-3" data-testid="automatic-invitation-context">
            <div>
              <Label htmlFor="verified-invitation-email" className="mb-2 block text-xs text-muted-foreground">Correo de la invitación</Label>
              <Input
                id="verified-invitation-email"
                value="Verificado por enlace seguro"
                readOnly
                aria-readonly="true"
                className="cursor-default bg-muted/45 px-3.5 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="verified-invitation-code" className="mb-2 block text-xs text-muted-foreground">Código de acceso</Label>
              <Input
                id="verified-invitation-code"
                value="Aplicado automáticamente"
                readOnly
                aria-readonly="true"
                className="cursor-default bg-muted/45 px-3.5 text-xs"
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="seller-email" className="sr-only">Correo electrónico</Label>
              <Input id="seller-email" name="email" type="email" placeholder="Correo de la invitación" autoComplete="email" defaultValue={initialEmail} disabled={pending} readOnly={Boolean(initialEmail)} required aria-invalid={Boolean(state.errors.email)} className={initialEmail ? "cursor-default bg-muted/45 px-3.5" : "px-3.5"} />
              <FieldError message={state.errors.email} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><Label className="text-xs text-muted-foreground">Código de acceso</Label><span className="text-xs text-muted-foreground">6 dígitos</span></div>
              <OtpCodeInput name="accessCode" initialValue={initialAccessCode} disabled={pending} readOnly={Boolean(initialAccessCode)} error={Boolean(state.errors.accessCode)} />
              <FieldError message={state.errors.accessCode} />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="seller-password" className="sr-only">Contraseña</Label>
          <Input id="seller-password" name="password" type="password" placeholder="Crea una contraseña" autoComplete="new-password" disabled={pending} required aria-invalid={Boolean(state.errors.password)} className="px-3.5" />
          <FieldError message={state.errors.password} />
        </div>
        <div>
          <Label htmlFor="seller-confirm-password" className="sr-only">Confirmar contraseña</Label>
          <Input id="seller-confirm-password" name="confirmPassword" type="password" placeholder="Confirma la contraseña" autoComplete="new-password" disabled={pending} required aria-invalid={Boolean(state.errors.confirmPassword)} className="px-3.5" />
          <FieldError message={state.errors.confirmPassword} />
        </div>

        <Button type="submit" disabled={pending} className="w-full font-normal shadow-none">
          {pending ? "Activando acceso..." : "Activar acceso"}
        </Button>
      </form>

      {tokenMode ? (
        <button type="button" onClick={onUseManual} className="w-full text-xs text-muted-foreground hover:text-foreground">
          Usar correo y código manual
        </button>
      ) : null}
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Si la invitación expiró o ya fue utilizada, solicita un nuevo enlace a tu administrador.
      </p>
      <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        ¿Ya activaste tu cuenta?{" "}
        <Link href={routes.login} className="font-medium text-foreground underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}

function SellerAccessFormController(props: SellerAccessFormProps) {
  const [manualMode, setManualMode] = useState(!props.actionToken);
  const activeToken = manualMode ? undefined : props.actionToken;
  const [state, formAction, pending] = useActionState(
    submitSellerAccess.bind(null, activeToken),
    initialSellerAccessState,
  );

  return (
    <SellerAccessFormView
      {...props}
      state={state}
      pending={pending}
      manualMode={manualMode}
      formAction={formAction}
      onUseManual={() => setManualMode(true)}
    />
  );
}

export function SellerActivationFormFromUrl() {
  const searchParams = useSearchParams();
  const activation = parseSellerActivationParams(searchParams);

  useLayoutEffect(() => {
    if (!window.location.search) return;
    cleanSellerActivationUrl(window.history, window.location);
  }, []);

  return <SellerAccessFormController {...activation} />;
}

export function SellerAccessForm(props: SellerAccessFormProps) {
  return <SellerAccessFormController {...props} />;
}
