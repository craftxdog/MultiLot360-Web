"use client";

import { BellRing, CalendarClock, MousePointer2, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParameterWorkspaceStore } from "../store/parameter-workspace.store";

const presets = [
  {
    key: "sales.allow_decimal_amounts",
    value: "true",
    title: "Ventas con decimales",
    description: "Permite capturar montos como 10.50 cuando la operación lo necesite.",
    icon: ReceiptText,
  },
  {
    key: "sales.void_window_minutes",
    value: "10",
    title: "Minutos para anular venta",
    description: "Define por cuánto tiempo se puede corregir un ticket vendido.",
    icon: ShieldCheck,
  },
  {
    key: "draws.auto_generate_daily",
    value: "true",
    title: "Turnos diarios automáticos",
    description: "Activa una regla global para que los sorteos recurrentes se preparen cada día.",
    icon: CalendarClock,
  },
  {
    key: "notifications.realtime_enabled",
    value: "true",
    title: "Notificaciones en vivo",
    description: "Mantiene visible la actividad reciente para usuarios con permiso.",
    icon: BellRing,
  },
] as const;

export function ParameterPresets({ canUpdate }: { canUpdate: boolean }) {
  const openCreate = useParameterWorkspaceStore((state) => state.openCreate);

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5" aria-labelledby="parameter-presets-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ejemplos guiados</p>
          <h2 id="parameter-presets-title" className="mt-2 text-lg font-medium tracking-[-0.03em] text-foreground">
            Configura sin memorizar claves técnicas
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Elige un ejemplo, revisa el valor y guárdalo solo si aplica a tu operación. La API sigue siendo la fuente de verdad.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {presets.map((preset) => {
          const Icon = preset.icon;

          return (
            <article key={preset.key} className="group rounded-2xl border border-border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-foreground/18 hover:shadow-[0_18px_55px_-38px_rgba(0,0,0,0.45)]">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card text-muted-foreground transition group-hover:text-foreground">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-4 text-sm font-medium text-foreground">{preset.title}</h3>
              <p className="mt-2 min-h-12 text-xs leading-5 text-muted-foreground">{preset.description}</p>
              <div className="mt-4 rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Clave</p>
                <p className="mt-1 truncate font-mono text-xs text-foreground">{preset.key}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-3 h-9 w-full gap-2"
                disabled={!canUpdate}
                onClick={() => openCreate({ key: preset.key, value: preset.value })}
              >
                <MousePointer2 className="h-3.5 w-3.5" />
                Usar ejemplo
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
