"use client";

import { Clock3, Lock, Power, TicketCheck } from "lucide-react";
import { useDrawOverview } from "../hooks/use-draw-shifts";
import { DrawsSkeleton } from "./draws-skeleton";

const cards = [
  { key: "open", label: "Abiertos", helper: "En operación", icon: Power, tone: "text-emerald-700 dark:text-emerald-300" },
  { key: "blocked", label: "Bloqueados", helper: "Pausados", icon: Lock, tone: "text-amber-700 dark:text-amber-300" },
  { key: "closed", label: "Cerrados", helper: "Finalizados", icon: Clock3, tone: "text-muted-foreground" },
  { key: "activeConfigurations", label: "Configuraciones", helper: "Horarios activos", icon: TicketCheck, tone: "text-sky-700 dark:text-sky-300" },
] as const;

export function DrawStatsCards() {
  const overview = useDrawOverview();

  if (overview.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => <DrawsSkeleton key={card.key} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.025)] transition-colors hover:border-foreground/15 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-foreground">{card.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
              </div>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/60 ${card.tone}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-5 font-mono text-2xl font-medium tabular-nums tracking-[-0.04em] text-foreground">
              {overview.error ? "—" : (overview.data?.[card.key] ?? 0)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
