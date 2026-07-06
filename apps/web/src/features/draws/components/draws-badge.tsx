import * as React from "react";

import { cn } from "@/lib/utils";

type DrawsBadgeVariant = "success" | "warning" | "danger" | "muted" | "default";

type DrawsBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: DrawsBadgeVariant;
};

const variants: Record<DrawsBadgeVariant, string> = {
  success:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger:
    "border-danger/25 bg-danger/10 text-danger",
  muted:
    "border-border bg-muted text-muted-foreground",
  default:
    "border-border bg-accent text-foreground",
};

export function DrawsBadge({
  className,
  variant = "default",
  ...props
}: DrawsBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
