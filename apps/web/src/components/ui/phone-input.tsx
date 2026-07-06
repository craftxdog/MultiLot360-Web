"use client";

import { cn } from "@/lib/utils";

type PhoneInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
};

function getLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("505")) {
    return digits.slice(3, 11);
  }

  return digits.slice(0, 8);
}

function formatLocalDigits(value: string) {
  const digits = getLocalDigits(value);

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

export function PhoneInput({
  name,
  value,
  onChange,
  disabled,
  error,
}: PhoneInputProps) {
  const localDigits = getLocalDigits(value);
  const normalizedValue = localDigits ? `+505${localDigits}` : "";

  return (
    <div data-focus-field={name}>
      <div
        className={cn(
          "flex h-10 overflow-hidden rounded-none border bg-background transition",
          error ? "border-danger/45" : "border-input",
          "focus-within:border-foreground/25",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-r border-border bg-muted/40 px-3 text-sm text-muted-foreground">
          <span aria-hidden="true">🇳🇮</span>
          <span className="font-medium text-foreground">+505</span>
        </div>

        <input
          type="tel"
          inputMode="numeric"
          value={formatLocalDigits(value)}
          disabled={disabled}
          placeholder="8888 9999"
          aria-invalid={error}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/55 disabled:cursor-not-allowed"
          onChange={(event) => {
            const digits = getLocalDigits(event.target.value);

            onChange(digits ? `+505${digits}` : "");
          }}
        />
      </div>

      <input type="hidden" name={name} value={normalizedValue} />
    </div>
  );
}
