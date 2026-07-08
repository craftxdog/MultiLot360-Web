"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  Check,
  HelpCircle,
  PencilLine,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useParameterMutations } from "../hooks/use-parameter-mutations";
import type { SystemParameter } from "../types/parameter.types";
import { formatParameterValuePreview } from "../utils/parameter-formatters";

type GuidedSetting = {
  key: string;
  fallbackValue: string;
  category: "Ventas" | "Tickets" | "Turnos" | "Alertas";
  title: string;
  description: string;
  effect: string;
  recommendation: string;
  type: "boolean" | "number" | "text";
  icon: typeof ReceiptText;
  suffix?: string;
};

const guidedSettings: GuidedSetting[] = [
  {
    key: "sales.allow_decimal_amounts",
    fallbackValue: "true",
    category: "Ventas",
    title: "Aceptar montos con decimales",
    description: "Permite que una venta use valores como 10.50 cuando la operación lo necesite.",
    effect: "Afecta la captura de tickets y validaciones de venta.",
    recommendation: "Déjalo activado si vendes montos variables o promociones.",
    type: "boolean",
    icon: ReceiptText,
  },
  {
    key: "sales.void_window_minutes",
    fallbackValue: "10",
    category: "Tickets",
    title: "Tiempo para corregir o anular",
    description: "Define cuántos minutos tiene el equipo para corregir un ticket después de venderlo.",
    effect: "Evita anulaciones tardías y mantiene la auditoría ordenada.",
    recommendation: "10 minutos suele ser suficiente para errores humanos.",
    type: "number",
    suffix: "min",
    icon: ShieldCheck,
  },
  {
    key: "draws.auto_generate_daily",
    fallbackValue: "true",
    category: "Turnos",
    title: "Preparar turnos automáticamente",
    description: "Indica si los sorteos recurrentes deben preparar turnos del día sin intervención manual.",
    effect: "Reduce olvidos operativos y mantiene abierto el flujo diario.",
    recommendation: "Actívalo para sorteos que se juegan todos los días.",
    type: "boolean",
    icon: CalendarClock,
  },
  {
    key: "notifications.realtime_enabled",
    fallbackValue: "true",
    category: "Alertas",
    title: "Alertas en vivo",
    description: "Controla si el sistema debe mostrar actividad reciente en la bandeja de notificaciones.",
    effect: "Ayuda a vendedores y administradores a reaccionar sin recargar.",
    recommendation: "Actívalo si hay varios usuarios trabajando a la vez.",
    type: "boolean",
    icon: BellRing,
  },
  {
    key: "tickets.footer_message",
    fallbackValue: "Gracias por su compra. Conserve este ticket.",
    category: "Tickets",
    title: "Mensaje al pie del ticket",
    description: "Texto corto que puede usarse como mensaje operativo en recibos o comprobantes.",
    effect: "Da claridad al cliente final cuando recibe su ticket.",
    recommendation: "Usa una frase breve y fácil de leer.",
    type: "text",
    icon: PencilLine,
  },
];

const categories = ["Todas", "Ventas", "Tickets", "Turnos", "Alertas"] as const;

function getCurrentValue(setting: GuidedSetting, parameters: SystemParameter[]) {
  return parameters.find((parameter) => parameter.key === setting.key)?.value;
}

function normalizeValue(setting: GuidedSetting, value: string) {
  if (setting.type === "boolean") return value === "true" ? "true" : "false";
  if (setting.type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? String(Math.max(0, Math.round(parsed))) : setting.fallbackValue;
  }

  return value.trim();
}

function GuidedControl({
  setting,
  value,
  onChange,
}: {
  setting: GuidedSetting;
  value: string;
  onChange: (value: string) => void;
}) {
  if (setting.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {value === "true" ? "Activado" : "Desactivado"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cambia esta regla con un toque.
          </p>
        </div>
        <Switch
          ariaLabel={`Cambiar ${setting.title}`}
          checked={value === "true"}
          onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={`guided-${setting.key}`}>
        {setting.type === "number" ? "Valor numérico" : "Texto visible"}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <Input
          id={`guided-${setting.key}`}
          type={setting.type === "number" ? "number" : "text"}
          min={setting.type === "number" ? 0 : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10"
        />
        {setting.suffix ? (
          <span className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            {setting.suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ParameterPresets({
  canUpdate,
  parameters,
}: {
  canUpdate: boolean;
  parameters: SystemParameter[];
}) {
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const { upsertParameter } = useParameterMutations();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return guidedSettings.filter((setting) => {
      const matchesCategory = category === "Todas" || setting.category === category;
      const matchesQuery =
        !normalized ||
        setting.title.toLowerCase().includes(normalized) ||
        setting.description.toLowerCase().includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const save = async (setting: GuidedSetting) => {
    const value = normalizeValue(setting, drafts[setting.key] ?? setting.fallbackValue);
    setDrafts((current) => ({ ...current, [setting.key]: value }));
    await upsertParameter.mutateAsync({ key: setting.key, value });
  };

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card" aria-labelledby="parameter-guide-title">
      <div className="border-b border-border bg-gradient-to-b from-muted/50 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Panel guiado
            </p>
            <h2 id="parameter-guide-title" className="mt-3 text-xl font-semibold tracking-[-0.04em] text-foreground">
              ¿Qué quieres cambiar hoy?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              No necesitas memorizar nombres técnicos. Elige un área, ajusta el valor y guarda. Abajo dejamos el catálogo avanzado para soporte.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/75 p-3 text-xs leading-5 text-muted-foreground lg:max-w-xs">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <HelpCircle className="h-4 w-4" />
              Cómo usarlo
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Elige un área.</li>
              <li>Cambia el valor de una regla.</li>
              <li>Presiona guardar para publicarlo en la API.</li>
            </ol>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar: decimales, tickets, turnos, alertas…"
              className="h-11 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`h-10 rounded-xl border px-3 text-sm transition ${
                  category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 xl:grid-cols-2">
        {filtered.map((setting) => {
          const Icon = setting.icon;
          const currentValue = getCurrentValue(setting, parameters);
          const draftValue = drafts[setting.key] ?? currentValue ?? setting.fallbackValue;
          const normalizedDraft = normalizeValue(setting, draftValue);
          const normalizedCurrent = currentValue === undefined ? undefined : normalizeValue(setting, currentValue);
          const changed = normalizedCurrent !== normalizedDraft;
          const configured = currentValue !== undefined;
          const saving = upsertParameter.isPending;

          return (
            <article key={setting.key} className="rounded-3xl border border-border bg-background/70 p-4 transition hover:border-foreground/15 hover:shadow-[0_20px_70px_-50px_rgba(0,0,0,0.55)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-card text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium tracking-[-0.02em] text-foreground">
                        {setting.title}
                      </h3>
                      <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {setting.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                  configured
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}>
                  {configured ? <Check className="h-3.5 w-3.5" /> : <HelpCircle className="h-3.5 w-3.5" />}
                  {configured ? "Configurado" : "Sugerido"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Valor actual</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
                    {currentValue === undefined ? "No configurado" : formatParameterValuePreview(currentValue)}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {setting.effect}
                  </p>
                </div>

                <div>
                  <GuidedControl
                    setting={setting}
                    value={draftValue}
                    onChange={(value) => setDrafts((current) => ({ ...current, [setting.key]: value }))}
                  />
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Recomendación: {setting.recommendation}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer select-none hover:text-foreground">Ver detalle técnico</summary>
                  <code className="mt-2 block rounded-xl border border-border bg-card px-3 py-2 text-[11px] text-foreground">
                    {setting.key}
                  </code>
                </details>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 gap-2"
                    disabled={!changed || saving}
                    onClick={() =>
                      setDrafts((current) => ({
                        ...current,
                        [setting.key]: currentValue ?? setting.fallbackValue,
                      }))
                    }
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revertir
                  </Button>
                  <Button
                    type="button"
                    className="h-10 gap-2"
                    disabled={!canUpdate || !changed || saving}
                    onClick={() => save(setting)}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Guardando…" : configured ? "Guardar cambio" : "Activar regla"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}

        {!filtered.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center xl:col-span-2">
            <Search className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No encontré una regla con esa búsqueda.</p>
            <p className="mt-1 text-xs text-muted-foreground">Prueba con ventas, tickets, turnos o alertas.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
