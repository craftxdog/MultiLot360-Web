import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NumberControlBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const tones = {
    neutral: "border-border bg-muted text-muted-foreground",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    info: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  } as const;
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium", tones[tone])}>{children}</span>;
}
