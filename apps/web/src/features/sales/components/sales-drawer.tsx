"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SalesDrawer({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = overflow; previous?.focus(); };
  }, [onClose, open]);
  return <AnimatePresence>{open ? <><motion.button type="button" aria-label="Cerrar panel" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} /><motion.aside role="dialog" aria-modal="true" aria-label={title} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}><header className="border-b border-border px-5 py-5 sm:px-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-foreground">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Button ref={closeRef} variant="ghost" className="h-9 w-9 px-0" aria-label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></Button></div></header><div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div></motion.aside></> : null}</AnimatePresence>;
}
