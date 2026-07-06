import * as React from "react";

import { cn } from "@/lib/utils";

export function DrawsSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-3xl border border-border bg-muted",
        className,
      )}
      {...props}
    />
  );
}
