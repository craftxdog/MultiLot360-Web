"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type EntityComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function optionText(option: EntityComboboxOption) {
  return option.description ? `${option.label} · ${option.description}` : option.label;
}

function findOption(options: EntityComboboxOption[], value: string | undefined) {
  return options.find((option) => option.value === value);
}

function resolveOption(options: EntityComboboxOption[], text: string) {
  const next = normalize(text);
  if (!next) return undefined;
  return options.find((option) => normalize(optionText(option)) === next || normalize(option.label) === next);
}

export function EntityCombobox({
  name,
  value,
  options,
  placeholder,
  ariaLabel,
  disabled,
  className,
  emptyLabel = "Sin opciones disponibles",
}: {
  name: string;
  value?: string;
  options: EntityComboboxOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  emptyLabel?: string;
}) {
  const selected = React.useMemo(() => findOption(options, value), [options, value]);
  const selectedText = selected ? optionText(selected) : "";

  return (
    <EntityComboboxInput
      key={`${name}-${selectedText}`}
      name={name}
      selectedText={selectedText}
      options={options}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      disabled={disabled}
      className={className}
      emptyLabel={emptyLabel}
    />
  );
}

function EntityComboboxInput({
  name,
  selectedText,
  options,
  placeholder,
  ariaLabel,
  disabled,
  className,
  emptyLabel,
}: {
  name: string;
  selectedText: string;
  options: EntityComboboxOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  emptyLabel: string;
}) {
  const listId = React.useId();
  const [draft, setDraft] = React.useState(selectedText);
  const resolved = resolveOption(options, draft);
  const hiddenValue = draft.trim() === "" ? "" : (resolved?.value ?? "");

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input type="hidden" name={name} value={hiddenValue} />
      <input
        aria-label={ariaLabel}
        list={listId}
        value={draft}
        disabled={disabled || options.length === 0}
        placeholder={options.length ? placeholder : emptyLabel}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          const match = resolveOption(options, draft);
          if (match) setDraft(optionText(match));
          if (!draft.trim()) setDraft("");
        }}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-background px-4 pl-10 text-sm text-foreground outline-none transition",
          "placeholder:text-muted-foreground",
          "focus:border-foreground/25 focus:bg-card focus:ring-2 focus:ring-foreground/8",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={optionText(option)} />
        ))}
      </datalist>
    </div>
  );
}
