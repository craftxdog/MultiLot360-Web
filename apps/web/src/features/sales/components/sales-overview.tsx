"use client";

import { CountUp } from "bynana-ui/count-up";
import { Ban, CalendarDays, CheckCircle2, ReceiptText } from "lucide-react";
import { useSalesOverview } from "../hooks/use-sales";

const cards = [
  { key: "today" as const, label: "Ventas de hoy", helper: "Tickets del día", icon: CalendarDays, tone: "text-sky-700 dark:text-sky-300" },
  { key: "active" as const, label: "Activas", helper: "Vigentes", icon: CheckCircle2, tone: "text-emerald-700 dark:text-emerald-300" },
  { key: "voided" as const, label: "Anuladas", helper: "Fuera del acumulado", icon: Ban, tone: "text-rose-700 dark:text-rose-300" },
  { key: "total" as const, label: "Histórico", helper: "Todos los tickets", icon: ReceiptText, tone: "text-violet-700 dark:text-violet-300" },
];

export function SalesOverview() {
  const result = useSalesOverview();
  return <section aria-label="Resumen de ventas" className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <article key={card.key} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"><div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-muted/70 transition-transform group-hover:scale-110" /><div className="relative flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{card.label}</p><p className="mt-3 font-mono text-2xl font-semibold text-foreground">{result.isLoading ? "—" : <CountUp end={result.data?.[card.key] ?? 0} duration={500} />}</p><p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">{card.helper}</p></div><span className={`rounded-xl border border-border bg-background p-2 ${card.tone}`}><Icon className="h-4 w-4" /></span></div></article>; })}</section>;
}
