"use client";

import { motion, useReducedMotion } from "framer-motion";
import { History, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SalesTab } from "../types/sales.types";

const tabs = [{ value: "sell" as const, label: "Vender", icon: Zap }, { value: "history" as const, label: "Historial", icon: History }];

export function SalesTabs({ value, available, onChange }: { value: SalesTab; available: SalesTab[]; onChange: (value: SalesTab) => void }) {
  const reduceMotion = useReducedMotion();
  return <div role="tablist" aria-label="Vistas de ventas" className="inline-flex rounded-2xl border border-border bg-muted/60 p-1">{tabs.filter((tab) => available.includes(tab.value)).map((tab) => { const active = tab.value === value; const Icon = tab.icon; return <button key={tab.value} type="button" role="tab" aria-selected={active} onClick={() => onChange(tab.value)} className={cn("relative inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition", active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{active ? <motion.span layoutId="sales-tab" className="absolute inset-0 rounded-xl bg-primary" transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }} /> : null}<Icon className="relative z-10 h-4 w-4" /><span className="relative z-10">{tab.label}</span></button>; })}</div>;
}
