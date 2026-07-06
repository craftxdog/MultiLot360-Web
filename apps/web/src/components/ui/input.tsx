import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition",
        "placeholder:text-muted-foreground",
        "focus:border-foreground/25 focus:bg-card focus:ring-2 focus:ring-foreground/8",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger/45 aria-invalid:ring-danger/10",
        className,
      )}
      {...props}
    />
    );
  },
);
