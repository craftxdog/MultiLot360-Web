"use client";

import { BlurFade } from "bynana-ui/blur-fade";
import { Boxes, Gauge, History, SlidersHorizontal } from "lucide-react";
import { useParameterOverview } from "../hooks/use-parameters";

export function ParameterSummaryCards() {
  const { data, isLoading } = useParameterOverview();
  const cards = [
    {
      label: "Parámetros",
      value: data?.total,
      detail: "claves registradas",
      icon: SlidersHorizontal,
    },
    {
      label: "Espacios",
      value: data?.isPartial ? undefined : data?.namespaces,
      detail: "dominios de configuración",
      icon: Boxes,
    },
    {
      label: "Cambios recientes",
      value: data?.isPartial ? undefined : data?.recentlyUpdated,
      detail: "últimos 7 días",
      icon: History,
    },
    {
      label: "Cobertura",
      value: data ? (data.isPartial ? "Parcial" : "Completa") : undefined,
      detail: data?.isPartial ? "más de 100 claves" : "lectura consolidada",
      icon: Gauge,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <BlurFade key={card.label} delay={index * 0.035}>
            <article className="h-full rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-card-foreground">
                    {isLoading || card.value === undefined ? "—" : card.value}
                  </p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {card.detail}
              </p>
            </article>
          </BlurFade>
        );
      })}
    </div>
  );
}
