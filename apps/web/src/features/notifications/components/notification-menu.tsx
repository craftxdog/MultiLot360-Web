"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { notificationKeys, notificationsQueryOptions, notificationUnreadQueryOptions } from "../queries/notification.queries";
import { notificationsService } from "../services/notifications.service";

const date = new Intl.DateTimeFormat("es-NI", { timeZone: "America/Managua", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const canRead = user?.permissions.includes("notificaciones.read") ?? false;
  const canUpdate = user?.permissions.includes("notificaciones.update") ?? false;
  const list = useQuery({ ...notificationsQueryOptions(), enabled: canRead && open });
  const count = useQuery({ ...notificationUnreadQueryOptions(), enabled: canRead, refetchInterval: 30_000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  const readOne = useMutation({ mutationFn: notificationsService.markRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: notificationsService.markAllRead, onSuccess: refresh });

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!canRead) return null;
  const unread = count.data?.unread ?? 0;

  return <div ref={root} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`} aria-expanded={open} className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground">
      <Bell className="h-4 w-4" />
      {unread ? <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">{Math.min(unread, 99)}</span> : null}
    </button>
    {open ? <section className="absolute right-0 top-11 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" aria-label="Bandeja de notificaciones">
      <header className="flex items-center justify-between border-b border-border p-4"><div><h2 className="text-sm font-medium">Notificaciones</h2><p className="mt-0.5 text-[11px] text-muted-foreground">{unread} pendientes</p></div>{canUpdate && unread ? <button type="button" onClick={() => readAll.mutate()} disabled={readAll.isPending} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><CheckCheck className="h-3.5 w-3.5" />Leer todas</button> : null}</header>
      <div className="max-h-[min(65vh,30rem)] overflow-y-auto">
        {list.isLoading ? <p className="p-5 text-sm text-muted-foreground">Cargando…</p> : list.error ? <p role="alert" className="p-5 text-sm text-danger">{list.error.message}</p> : list.data?.data.length ? list.data.data.map((item) => <button key={item.id} type="button" disabled={!canUpdate || Boolean(item.readAt)} onClick={() => readOne.mutate(item.id)} className={`block w-full border-b border-border p-4 text-left transition last:border-0 ${item.readAt ? "bg-card" : "bg-primary/5 hover:bg-primary/10"}`}><span className="flex items-start gap-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? "bg-border" : "bg-primary"}`} /><span className="min-w-0"><span className="block text-sm font-medium text-foreground">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.message}</span><span className="mt-2 block text-[10px] uppercase tracking-wide text-muted-foreground">{date.format(new Date(item.createdAt))}</span></span></span></button>) : <div className="grid place-items-center p-8 text-center"><Inbox className="h-6 w-6 text-muted-foreground" /><p className="mt-3 text-sm">Tu bandeja está al día.</p></div>}
      </div>
    </section> : null}
  </div>;
}
