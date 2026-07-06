"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  defaultChecked = false,
  disabled,
  name,
  value = "on",
  ariaLabel,
  onCheckedChange,
  className,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  ariaLabel?: string;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}) {
  const controlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const active = controlled ? checked : internal;

  function update(next: boolean) {
    if (!controlled) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={active ? value : ""} /> : null}
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => update(!active)}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent p-0.5 transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          active ? "bg-primary" : "bg-muted",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
            active ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </>
  );
}
