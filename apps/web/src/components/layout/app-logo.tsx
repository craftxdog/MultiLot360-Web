import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  collapsed?: boolean;
};

export function AppLogo({ collapsed = false }: AppLogoProps) {
  return (
    <Link
      href={routes.dashboard}
      className={cn(
        "group flex h-12 items-center gap-3 rounded-xl px-2 transition hover:bg-accent",
        collapsed && "justify-center px-0",
      )}
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-accent">
        <div className="relative h-4 w-4 animate-[spin_10s_linear_infinite]">
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/90" />
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-foreground/90" />
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 rotate-90 bg-foreground/90" />
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/90" />
        </div>
      </div>

      {!collapsed ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-[-0.02em] text-foreground">
            MultiLot 360
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Centro operativo
          </p>
        </div>
      ) : null}
    </Link>
  );
}
