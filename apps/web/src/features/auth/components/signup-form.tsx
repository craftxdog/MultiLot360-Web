"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "../actions/auth-action-state";
import { signupAction } from "../actions/signup.action";

const passwordFields = [
  {
    id: "password",
    label: "Contraseña",
    placeholder: "Mínimo 8 caracteres",
  },
  {
    id: "confirmPassword",
    label: "Confirmar",
    placeholder: "Repite la contraseña",
  },
] as const;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-5 text-danger"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className="text-xs text-muted-foreground">
            Nombre
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Admin principal"
            autoComplete="name"
            disabled={pending}
            required
            aria-invalid={Boolean(state.errors?.name)}
            className="mt-2 px-3.5"
          />
          <FieldError message={state.errors?.name} />
        </div>

        <div>
          <Label htmlFor="username" className="text-xs text-muted-foreground">
            Usuario
          </Label>
          <Input
            id="username"
            name="username"
            placeholder="admin"
            autoComplete="username"
            autoCapitalize="none"
            disabled={pending}
            required
            aria-invalid={Boolean(state.errors?.username)}
            className="mt-2 px-3.5"
          />
          <FieldError message={state.errors?.username} />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-xs text-muted-foreground">
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@empresa.com"
          autoComplete="email"
          autoCapitalize="none"
          disabled={pending}
          required
          aria-invalid={Boolean(state.errors?.email)}
          className="mt-2 px-3.5"
        />
        <FieldError message={state.errors?.email} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {passwordFields.map((field) => (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-xs text-muted-foreground">
              {field.label}
            </Label>
            <div className="relative mt-2">
              <Input
                id={field.id}
                name={field.id}
                type={showPassword ? "text" : "password"}
                placeholder={field.placeholder}
                autoComplete="new-password"
                disabled={pending}
                required
                aria-invalid={Boolean(state.errors?.[field.id])}
                className="px-3.5 pr-10"
              />
              {field.id === "password" ? (
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : null}
            </div>
            <FieldError message={state.errors?.[field.id]} />
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full font-normal"
        disabled={pending}
      >
        {pending ? "Creando acceso..." : "Crear cuenta administradora"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={routes.login}
          className="text-foreground underline decoration-border underline-offset-4 hover:opacity-70"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
