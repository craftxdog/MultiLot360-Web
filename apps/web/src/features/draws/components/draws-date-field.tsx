"use client";

import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DrawsDateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function DrawsDateField({
  value,
  onChange,
  className,
}: DrawsDateFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="date"
        aria-label="Filtrar por fecha"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-10"
      />
    </div>
  );
}
