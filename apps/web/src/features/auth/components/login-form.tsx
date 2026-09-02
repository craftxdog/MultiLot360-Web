"use client";

import Link from "next/link";
import { Building2, CheckCircle2, Eye, EyeOff, KeyRound, LifeBuoy, Store } from "lucide-react";
import { useActionState, useState } from "react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { initialAuthActionState } from "../actions/auth-action-state";
import { loginAction } from "../actions/login.action";
import { SellerAccessForm } from "./seller-access-form";

type LoginFormProps = {
  next?: string;
  initialTenant?: string;
  signupSuccess?: boolean;
};

type LoginMode = "credentials" | "seller-access";

export function LoginForm({ next, initialTenant, signupSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<LoginMode>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialAuthActionState,
  );
  const recoveryHref = email.trim()
    ? `${routes.forgotPassword}?email=${encodeURIComponent(email.trim())}`
    : routes.forgotPassword;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 rounded-xl border border-border bg-muted/60 p-1">
        <button
          type="button"
          onClick={() => setMode("credentials")}
          aria-pressed={mode === "credentials"}
          className={cn(
            "flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[11px] leading-none transition sm:gap-2 sm:text-xs",
            mode === "credentials"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("seller-access")}
          aria-pressed={mode === "seller-access"}
          className={cn(
            "flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[11px] leading-none transition sm:gap-2 sm:text-xs",
            mode === "seller-access"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Store className="h-3.5 w-3.5" />
          Activar vendedor
        </button>
      </div>

      {mode === "seller-access" ? (
        <SellerAccessForm next={next} />
      ) : (
        <form action={formAction} className="space-y-4">
          {next ? <input name="next" type="hidden" value={next} /> : null}

          {signupSuccess ? (
            <div role="status" className="flex gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3.5 py-3 text-sm leading-5 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Empresa registrada. Verifica tu correo y entra para generar el primer documento de cobro.</p>
            </div>
          ) : null}

          {state.message ? (
            <div
              role="alert"
              className="rounded-xl border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-5 text-danger"
            >
              {state.message}
            </div>
          ) : null}

          <div>
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@empresa.com"
              autoComplete="email"
              autoCapitalize="none"
              disabled={pending}
              required
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              aria-invalid={Boolean(state.errors?.email)}
              className="mt-2 px-3.5"
            />
            <FieldError message={state.errors?.email} />
          </div>

          <div>
            <Label htmlFor="tenant" className="text-xs text-muted-foreground">
              Empresa <span className="font-normal opacity-70">(si tu cuenta tiene varias)</span>
            </Label>
            <div className="relative mt-2">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tenant"
                name="tenant"
                defaultValue={initialTenant}
                placeholder="mi-empresa"
                autoComplete="organization"
                autoCapitalize="none"
                disabled={pending}
                aria-invalid={Boolean(state.errors?.tenant)}
                className="pl-10"
              />
            </div>
            <FieldError message={state.errors?.tenant} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Contraseña
              </Label>
              <Link
                href={recoveryHref}
                className="text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
              >
                Olvidé mi contraseña
              </Link>
            </div>
            <div className="relative mt-2">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                disabled={pending}
                required
                aria-invalid={Boolean(state.errors?.password)}
                className="px-3.5 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError message={state.errors?.password} />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full font-normal shadow-none"
          >
            {pending ? "Verificando acceso..." : "Entrar a MultiLot"}
          </Button>

          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
            <div className="flex gap-2">
              <LifeBuoy className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                Si no recuerdas la contraseña, usa el reset público. Te enviaremos
                un código de un solo uso sin revelar si el correo existe.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            ¿Nueva empresa?{" "}
            <Link href={routes.signup} className="font-medium text-foreground underline decoration-border underline-offset-4">
              Ver planes y crear acceso
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
