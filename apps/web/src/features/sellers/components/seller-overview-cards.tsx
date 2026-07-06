"use client";

import { CircleAlert, Clock3, ShieldCheck, UserRoundCheck } from "lucide-react";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { useSellerOverview } from "../hooks/use-sellers";

export function SellerOverviewCards() {
  const { data, isLoading } = useSellerOverview();
  const attention = data ? data.expired + data.revoked : undefined;
  const activationRate = data && data.total > 0
    ? Math.round((data.activated / data.total) * 100)
    : 0;
  const cards = [
    { label: "Identidades", value: data?.total, detail: "registradas por la API", icon: ShieldCheck },
    { label: "Accesos activos", value: data?.activated, detail: `${activationRate}% de activación`, icon: UserRoundCheck },
    { label: "Por activar", value: data?.pending, detail: "esperan confirmación", icon: Clock3 },
    { label: "Requieren atención", value: attention, detail: "expirados o revocados", icon: CircleAlert },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const hidePartialValue = data?.isPartial && card.label !== "Identidades";

        return (
          <MotionReveal key={card.label} delay={index * 0.035}>
            <article className="h-full rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-card-foreground">
                    {isLoading || card.value === undefined || hidePartialValue
                      ? "—"
                      : card.value}
                  </p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {hidePartialValue ? "El API debe agregar este total" : card.detail}
              </p>
            </article>
          </MotionReveal>
        );
      })}
      {data?.isPartial ? (
        <p className="text-xs text-muted-foreground sm:col-span-2 xl:col-span-4">
          El total es exacto. El desglose por estado requiere el endpoint agregado del API para volúmenes mayores de 100.
        </p>
      ) : null}
    </div>
  );
}
