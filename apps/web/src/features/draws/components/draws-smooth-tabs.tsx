"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type DrawsTabOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type DrawsSmoothTabsProps<TValue extends string> = {
  value: TValue;
  options: DrawsTabOption<TValue>[];
  onChange: (value: TValue) => void;
};

export function DrawsSmoothTabs<TValue extends string>({
  value,
  options,
  onChange,
}: DrawsSmoothTabsProps<TValue>) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Vistas de sorteos y turnos"
      className="inline-flex rounded-2xl border border-border bg-muted/60 p-1"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative h-9 rounded-xl px-4 text-sm font-medium transition",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="draws-active-tab"
                className="absolute inset-0 rounded-xl bg-primary"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 30 }
                }
              />
            ) : null}

            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
