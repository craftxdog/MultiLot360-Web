"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type DrawsSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type DrawsSelectProps<TValue extends string> = {
  value: TValue;
  options: DrawsSelectOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
  ariaLabel: string;
};

export function DrawsSelect<TValue extends string>({
  value,
  options,
  onChange,
  className,
  ariaLabel,
}: DrawsSelectProps<TValue>) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm text-foreground outline-none transition",
          "focus:border-foreground/25 focus:bg-card focus:ring-2 focus:ring-foreground/8",
        )}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-card text-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
