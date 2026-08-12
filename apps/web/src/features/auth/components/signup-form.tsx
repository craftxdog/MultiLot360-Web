"use client";

import Link from "next/link";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BillingCurrency, BillingPlan } from "@/features/billing/types/billing.types";
import { formatBillingMoney } from "@/features/billing/utils/billing-formatters";
import { cn } from "@/lib/utils";
import { initialAuthActionState } from "../actions/auth-action-state";
import { signupAction } from "../actions/signup.action";

function toCompanySlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const planIcon = {
  STARTER: Users,
  BUSINESS: Sparkles,
  ENTERPRISE: ShieldCheck,
} as const;

export function SignupForm({ plans }: { plans: BillingPlan[] }) {
  const currencies = Array.from(new Set(plans.map((plan) => plan.currency)));
  const [currency, setCurrency] = useState<BillingCurrency>(
    currencies.includes("USD") ? "USD" : currencies[0] ?? "USD",
  );
  const visiblePlans = useMemo(
    () => plans.filter((plan) => plan.currency === currency),
    [currency, plans],
  );
  const [selectedPlanId, setSelectedPlanId] = useState(
    visiblePlans.find((plan) => plan.code === "BUSINESS")?.id ?? visiblePlans[0]?.id ?? "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialAuthActionState,
  );

  function selectCurrency(next: BillingCurrency) {
    setCurrency(next);
    const nextPlans = plans.filter((plan) => plan.currency === next);
    setSelectedPlanId(
      nextPlans.find((plan) => plan.code === "BUSINESS")?.id ?? nextPlans[0]?.id ?? "",
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="paymentMethod" value="BANK_TRANSFER" />
      <input type="hidden" name="timezone" value="America/Managua" />

      {state.message ? (
        <div role="alert" className="rounded-xl border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-5 text-danger">
          {state.message}
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">1. Selecciona el plan</p>
            <p className="mt-1 text-xs text-muted-foreground">Precios mensuales del catálogo oficial AlphaBy.</p>
          </div>
          {currencies.length > 1 ? (
            <div className="flex rounded-lg border border-border bg-muted/40 p-1">
              {currencies.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectCurrency(item)}
                  className={cn(
                    "h-8 rounded-md px-3 text-xs font-medium transition",
                    currency === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {visiblePlans.length ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {visiblePlans.map((plan) => {
              const Icon = planIcon[plan.code as keyof typeof planIcon] ?? Landmark;
              const selected = selectedPlanId === plan.id;
              return (
                <label
                  key={plan.id}
                  className={cn(
                    "relative cursor-pointer rounded-2xl border p-4 transition",
                    selected
                      ? "border-foreground/35 bg-foreground text-background shadow-lg shadow-foreground/5"
                      : "border-border bg-background hover:border-foreground/20 hover:bg-accent",
                  )}
                >
                  <input
                    type="radio"
                    name="priceId"
                    value={plan.id}
                    checked={selected}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between gap-2">
                    <Icon className="h-4 w-4" />
                    {selected ? <Check className="h-4 w-4" /> : null}
                  </div>
                  <p className="mt-5 text-sm font-medium">{plan.name}</p>
                  <p className={cn("mt-1 whitespace-nowrap text-base font-semibold tracking-tight", selected ? "text-background" : "text-foreground")}>
                    {formatBillingMoney(plan.amountMinor, plan.currency)}
                    <span className="ml-1 text-[10px] font-normal opacity-60">/ mes</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-4 opacity-65">{plan.description}</p>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-700 dark:text-amber-300">
            El catálogo de planes no está disponible en este momento. Intenta nuevamente más tarde.
          </div>
        )}
        <FieldError message={state.errors?.priceId} />
      </section>

      <section className="space-y-4 border-t border-border pt-5">
        <div>
          <p className="text-sm font-medium">2. Configura la empresa</p>
          <p className="mt-1 text-xs text-muted-foreground">Cada empresa opera en un tenant completamente aislado.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="companyName" className="text-xs text-muted-foreground">Nombre comercial</Label>
            <div className="relative mt-2">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="companyName"
                name="companyName"
                value={companyName}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setCompanyName(value);
                  if (!slugEdited) setCompanySlug(toCompanySlug(value));
                }}
                placeholder="Lotería Central, S.A."
                autoComplete="organization"
                disabled={pending}
                required
                aria-invalid={Boolean(state.errors?.companyName)}
                className="pl-10"
              />
            </div>
            <FieldError message={state.errors?.companyName} />
          </div>
          <div>
            <Label htmlFor="companySlug" className="text-xs text-muted-foreground">Identificador de empresa</Label>
            <Input
              id="companySlug"
              name="companySlug"
              value={companySlug}
              onChange={(event) => {
                setSlugEdited(true);
                setCompanySlug(toCompanySlug(event.currentTarget.value));
              }}
              placeholder="loteria-central"
              autoCapitalize="none"
              spellCheck={false}
              disabled={pending}
              required
              aria-invalid={Boolean(state.errors?.companySlug)}
              className="mt-2 font-mono text-xs"
            />
            <FieldError message={state.errors?.companySlug} />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-5">
        <div>
          <p className="text-sm font-medium">3. Crea al propietario</p>
          <p className="mt-1 text-xs text-muted-foreground">Este acceso podrá administrar facturación, módulos y equipo.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground">Nombre completo</Label>
            <Input id="name" name="name" placeholder="Ana Pérez" autoComplete="name" disabled={pending} required aria-invalid={Boolean(state.errors?.name)} className="mt-2" />
            <FieldError message={state.errors?.name} />
          </div>
          <div>
            <Label htmlFor="username" className="text-xs text-muted-foreground">Usuario</Label>
            <Input id="username" name="username" placeholder="ana.perez" autoComplete="username" autoCapitalize="none" disabled={pending} required aria-invalid={Boolean(state.errors?.username)} className="mt-2" />
            <FieldError message={state.errors?.username} />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="text-xs text-muted-foreground">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="propietario@empresa.com" autoComplete="email" autoCapitalize="none" disabled={pending} required aria-invalid={Boolean(state.errors?.email)} className="mt-2" />
          <FieldError message={state.errors?.email} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["password", "confirmPassword"] as const).map((id) => (
            <div key={id}>
              <Label htmlFor={id} className="text-xs text-muted-foreground">{id === "password" ? "Contraseña" : "Confirmar contraseña"}</Label>
              <div className="relative mt-2">
                <Input
                  id={id}
                  name={id}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={pending}
                  required
                  aria-invalid={Boolean(state.errors?.[id])}
                  className="pr-11"
                />
                {id === "password" ? (
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                ) : null}
              </div>
              <FieldError message={state.errors?.[id]} />
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
        <div className="flex gap-3">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <p>
            El alta crea la empresa en estado pendiente de pago. Después de verificar el correo podrás generar el documento comercial de cobro y registrar la transferencia bancaria exacta.
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending || !selectedPlanId}>
        {pending ? "Creando empresa segura..." : "Crear empresa y continuar"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tienes acceso?{" "}
        <Link href={routes.login} className="font-medium text-foreground underline decoration-border underline-offset-4">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
