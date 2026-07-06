"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SellerView = "directory" | "flow";

type SellerViewSwitcherProps = {
  view: SellerView;
  baseParams: Record<string, string | undefined>;
};

export function SellerViewSwitcher({
  view,
  baseParams,
}: SellerViewSwitcherProps) {
  const pathname = usePathname();
  const items = [
    { label: "Directorio", value: "directory" as const, icon: List },
    { label: "Flujo", value: "flow" as const, icon: LayoutGrid },
  ];

  const changeView = (nextView: SellerView) => {
    const params = new URLSearchParams();

    Object.entries(baseParams).forEach(([key, value]) => {
      if (value && key !== "view") params.set(key, value);
    });
    params.set("view", nextView);
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex rounded-lg border border-border bg-accent p-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = view === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => changeView(item.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
