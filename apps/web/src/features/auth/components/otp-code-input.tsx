"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type OtpCodeInputProps = {
  name: string;
  initialValue?: string;
  disabled?: boolean;
  error?: boolean;
};

const OTP_LENGTH = 6;

function normalizeOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function OtpCodeInput({
  name,
  initialValue = "",
  disabled,
  error,
}: OtpCodeInputProps) {
  const [value, setValue] = useState(() => normalizeOtp(initialValue));

  return (
    <div data-focus-field={name} className={disabled ? "pointer-events-none opacity-50" : undefined}>
      <input
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={OTP_LENGTH}
        value={value}
        onChange={(event) => setValue(normalizeOtp(event.target.value))}
        disabled={disabled}
        className={cn("h-14 w-full rounded-xl border bg-background px-4 text-center font-mono text-xl tracking-[0.7em] text-foreground outline-none transition focus:border-foreground/25", error ? "border-danger/45" : "border-input")}
        aria-label="Código de acceso de 6 dígitos"
        aria-invalid={error}
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={error ? "text-danger" : "text-muted-foreground"}>Código de un solo uso</span>
        <span className="text-muted-foreground">{value.length}/6</span>
      </div>
    </div>
  );
}
