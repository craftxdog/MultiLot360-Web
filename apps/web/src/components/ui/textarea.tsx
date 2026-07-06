import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition",
        "placeholder:text-muted-foreground",
        "focus:border-foreground/25 focus:bg-card focus:ring-2 focus:ring-foreground/8",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger/45 aria-invalid:ring-danger/10",
        className,
      )}
      {...props}
    />
  );
});
