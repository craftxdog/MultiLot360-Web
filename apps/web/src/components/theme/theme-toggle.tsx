"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
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
];

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
      <div className="hidden h-9 w-28 rounded-lg border border-border bg-accent sm:block" />
    );
  }

  return (
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
            onClick={() => setTheme(item.value)}
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
  );
}
