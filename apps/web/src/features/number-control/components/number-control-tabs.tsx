"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Ban, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NumberControlTab } from "../types/number-control.types";

const tabs = [
  { value: "limits" as const, label: "Límites", icon: Gauge },
  { value: "blocked" as const, label: "Bloqueados", icon: Ban },
];

export function NumberControlTabs({ value, available, onChange }: { value: NumberControlTab; available: NumberControlTab[]; onChange: (value: NumberControlTab) => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <div role="tablist" aria-label="Vistas de control numérico" className="inline-flex rounded-2xl border border-border bg-muted/60 p-1">
      {tabs.filter((tab) => available.includes(tab.value)).map((tab) => {
        const active = value === tab.value;
        const Icon = tab.icon;
        return (
          <button key={tab.value} type="button" role="tab" aria-selected={active} onClick={() => onChange(tab.value)} className={cn("relative inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition", active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {active ? <motion.span layoutId="number-control-tab" className="absolute inset-0 rounded-xl bg-primary" transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }} /> : null}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
