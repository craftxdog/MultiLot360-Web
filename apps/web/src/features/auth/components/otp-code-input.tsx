"use client";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "bynana-ui/input-otp";
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
      <input type="hidden" name={name} value={value} />
      <InputOTP
        maxLength={OTP_LENGTH}
        value={value}
        onChange={(nextValue) => setValue(normalizeOtp(nextValue))}
        className="w-full"
        aria-label="Código de acceso de 6 dígitos"
        aria-invalid={error}
      >
        <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
          {Array.from({ length: OTP_LENGTH }, (_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              aria-label={`Dígito ${index + 1}`}
              className={cn(
                "h-12 w-full rounded-xl border bg-background text-base font-medium text-foreground",
                error
                  ? "border-danger/45"
                  : "border-input focus-within:border-foreground/25",
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={error ? "text-danger" : "text-muted-foreground"}>Código de un solo uso</span>
        <span className="text-muted-foreground">{value.length}/6</span>
      </div>
    </div>
  );
}
