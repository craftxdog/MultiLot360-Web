"use client";

import { cn } from "@/lib/utils";

type DrawsSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
};

export function DrawsSwitch({
  checked,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
}: DrawsSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full border border-border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        checked ? "bg-primary" : "bg-muted",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-primary-foreground shadow transition",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
