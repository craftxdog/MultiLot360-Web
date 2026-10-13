"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type DrawsTabOption<TValue extends string> = {
  label: string;
  mobileLabel?: string;
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
      className="flex w-full rounded-2xl border border-border bg-muted/60 p-1 sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex h-9 min-w-0 flex-1 items-center justify-center rounded-xl px-2 text-xs font-medium transition sm:px-4 sm:text-sm",
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

            <span aria-hidden="true" className="relative z-10 truncate sm:hidden">{option.mobileLabel ?? option.label}</span>
            <span aria-hidden="true" className="relative z-10 hidden truncate sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
