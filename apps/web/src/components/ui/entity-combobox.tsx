"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
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

export function EntityCombobox({
  name,
  value,
  options,
  placeholder,
  ariaLabel,
  disabled,
  className,
  emptyLabel = "Sin opciones disponibles",
  onValueChange,
}: {
  name: string;
  value?: string;
  options: EntityComboboxOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  emptyLabel?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <EntityComboboxInput
      key={`${name}-${value ?? ""}`}
      name={name}
      value={value ?? ""}
      options={options}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      disabled={disabled}
      className={className}
      emptyLabel={emptyLabel}
      onValueChange={onValueChange}
    />
  );
}

function EntityComboboxInput({
  name,
  value,
  options,
  placeholder,
  ariaLabel,
  disabled,
  className,
  emptyLabel,
  onValueChange,
}: {
  name: string;
  value: string;
  options: EntityComboboxOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  emptyLabel: string;
  onValueChange?: (value: string) => void;
}) {
  const listboxId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [currentValue, setCurrentValue] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const isDisabled = disabled || options.length === 0;
  const selected = React.useMemo(() => findOption(options, currentValue), [currentValue, options]);
  const filtered = React.useMemo(() => {
    const clean = normalize(query);
    if (!clean) return options;
    return options.filter((option) => normalize(optionText(option)).includes(clean));
  }, [options, query]);

  React.useEffect(() => {
    if (!open) return;
    window.setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (option: EntityComboboxOption | null) => {
    const nextValue = option?.value ?? "";
    setCurrentValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={currentValue} />
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={isDisabled}
        onClick={() => {
          if (!open) setQuery("");
          setOpen(!open);
        }}
        className={cn(
          "group flex h-11 w-full items-center gap-3 rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground outline-none transition",
          "focus:border-foreground/25 focus:bg-card focus:ring-2 focus:ring-foreground/8",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn("min-w-0 flex-1 truncate", selected ? "text-foreground" : "text-muted-foreground")}>
          {selected ? optionText(selected) : options.length ? placeholder : emptyLabel}
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Limpiar selección"
            onClick={(event) => {
              event.stopPropagation();
              choose(null);
            }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-[70] mt-2 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtrar opciones…"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8"
              />
            </div>
          </div>
          <div id={listboxId} role="listbox" aria-label={ariaLabel} className="max-h-72 overflow-y-auto p-1">
            {filtered.length ? filtered.map((option) => {
              const active = option.value === currentValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(option)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border", active ? "border-primary-foreground/30 bg-primary-foreground/12" : "border-border bg-background")}>
                    {active ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{option.label}</span>
                    {option.description ? <span className={cn("mt-0.5 block truncate text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>{option.description}</span> : null}
                  </span>
                </button>
              );
            }) : <p className="px-3 py-8 text-center text-sm text-muted-foreground">No hay coincidencias.</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
