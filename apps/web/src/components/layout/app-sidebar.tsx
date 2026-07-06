"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { NavigationGroup } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { AppLogo } from "./app-logo";
import { NavigationIcon } from "./navigation-icon";

type AppSidebarProps = {
  groups: NavigationGroup[];
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function AppSidebar({ groups }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const displayName = user?.name ?? user?.username ?? "Usuario";

  return (
    <aside className="hidden h-screen w-68 shrink-0 border-r border-border bg-background lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="px-4 py-4">
        <AppLogo />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <nav className="space-y-7">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <NavigationIcon
                        name={item.icon}
                        className={cn(
                          "h-4.25 w-4.25 transition",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />

                      <span className="flex-1 truncate">{item.title}</span>

                      {item.badge ? (
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {item.badge}
                        </span>
                      ) : null}

                      {active ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : null}

                      {active ? (
                        <span className="absolute left-0 top-1/2 h-4 w-px -translate-y-1/2 bg-foreground/70" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {displayName.slice(0, 1).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.role.name ?? "Usuario"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
