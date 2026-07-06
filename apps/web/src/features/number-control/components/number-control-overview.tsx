"use client";

import { Ban, Globe2, ShieldCheck, UserRound } from "lucide-react";
import { useNumberControlOverview } from "../hooks/use-number-control";

const cards = [
  { key: "activeLimits" as const, label: "Límites vigentes", helper: "Protecciones activas", icon: ShieldCheck, tone: "text-emerald-700 dark:text-emerald-300" },
  { key: "globalLimits" as const, label: "Cobertura global", helper: "Todos los vendedores", icon: Globe2, tone: "text-sky-700 dark:text-sky-300" },
  { key: "sellerLimits" as const, label: "Personalizados", helper: "Por vendedor", icon: UserRound, tone: "text-violet-700 dark:text-violet-300" },
  { key: "blockedNumbers" as const, label: "Bloqueos", helper: "Excepciones registradas", icon: Ban, tone: "text-rose-700 dark:text-rose-300" },
];

export function NumberControlOverview() {
  const result = useNumberControlOverview();
  return (
    <section aria-label="Resumen de control numérico" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-muted/70 transition-transform group-hover:scale-110" />
            <div className="relative flex items-start justify-between gap-3">
              <div><p className="text-xs text-muted-foreground">{card.label}</p><p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-foreground">{result.isLoading ? "—" : (result.data?.[card.key] ?? 0)}</p><p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">{card.helper}</p></div>
              <span className={`rounded-xl border border-border bg-background p-2 ${card.tone}`}><Icon className="h-4 w-4" /></span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
