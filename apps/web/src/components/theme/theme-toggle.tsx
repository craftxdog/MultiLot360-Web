"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";

const items = [
  {
    value: "light",
    label: "Claro",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Oscuro",
    icon: Moon,
  },
  {
    value: "system",
    label: "Sistema",
    icon: Monitor,
  },
] as const;

function subscribe() {
  return () => { };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useIsClient() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function ThemeToggle() {
  const isClient = useIsClient();
  const { theme, setTheme } = useTheme();

  if (!isClient) {
    return (
      <div aria-hidden="true" className="h-9 w-9 shrink-0 rounded-lg border border-border bg-accent sm:w-28" />
    );
  }

  return <ThemeToggleView theme={theme} onThemeChange={setTheme} />;
}

export function ThemeToggleView({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  const selectedItem = items.find((item) => item.value === theme) ?? items[1];
  const SelectedIcon = selectedItem.icon;

  return (
    <>
      <div
        className="relative h-9 w-9 shrink-0 rounded-lg border border-border bg-accent focus-within:ring-2 focus-within:ring-ring sm:hidden"
        title={`Tema: ${selectedItem.label}`}
      >
        <select
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as Theme)}
          aria-label="Seleccionar tema"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none grid h-full w-full place-items-center text-foreground" aria-hidden="true">
          <SelectedIcon className="h-4 w-4" />
        </span>
      </div>

      <div className="hidden shrink-0 rounded-lg border border-border bg-accent p-1 sm:inline-flex">
        {items.map((item) => {
          const Icon = item.icon;
          const active = theme === item.value;

          return (
            <button
              key={item.value}
              type="button"
              title={item.label}
              aria-label={`Tema ${item.label}`}
              onClick={() => onThemeChange(item.value)}
              className={cn(
                "inline-flex h-7 w-8 items-center justify-center rounded-md transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    </>
  );
}
