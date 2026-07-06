"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationGroup } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { AppLogo } from "./app-logo";
import { NavigationIcon } from "./navigation-icon";

export function MobileNavigation({ groups }: { groups: NavigationGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const drawer = open ? createPortal(
    <AnimatePresence>
      <>
        <motion.button
          type="button"
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-[100] cursor-default bg-black/55 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        />
        <motion.aside
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Navegación principal"
          className="fixed inset-y-0 left-0 z-[110] flex w-[min(88vw,22rem)] flex-col border-r border-border bg-background shadow-2xl lg:hidden"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="flex h-16 items-center justify-between border-b border-border px-4">
            <AppLogo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </header>
          <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                        <NavigationIcon name={item.icon} className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge ? <span className="rounded-full border border-border px-2 py-0.5 text-[10px]">{item.badge}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </motion.aside>
      </>
    </AnimatePresence>,
    document.body,
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Abrir navegación"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        <Menu className="h-4 w-4" />
      </button>
      {drawer}
    </>
  );
}
