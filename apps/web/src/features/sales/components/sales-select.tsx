"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SalesSelect<T extends string>({ value, options, onChange, ariaLabel, className }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; ariaLabel: string; className?: string }) {
  return <div className={cn("relative", className)}><select value={value} aria-label={ariaLabel} onChange={(event) => onChange(event.target.value as T)} className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm text-foreground outline-none transition focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /></div>;
}
