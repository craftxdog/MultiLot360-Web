"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, CheckCheck, Inbox, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import {
  notificationKeys,
  notificationsQueryOptions,
  notificationUnreadQueryOptions,
} from "../queries/notification.queries";
import { notificationsService } from "../services/notifications.service";
import type { NotificationItem } from "../types/notification.types";

const date = new Intl.DateTimeFormat("es-NI", {
  timeZone: "America/Managua",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const unreadQuery = {
  page: 1,
  limit: 25,
  unread: true,
  sortBy: "createdAt" as const,
  sortDirection: "desc" as const,
};

function humanizeKey(value: string) {
  return value
    .replace(/[_:-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatNotificationType(value: string) {
  return humanizeKey(value.toLowerCase()).replace(/\bHttp\b/g, "HTTP");
}

function formatPayloadValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Sin dato";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") {
    return new Intl.NumberFormat("es-NI").format(value);
  }
  if (typeof value === "string") {
    const parsed = new Date(value);

    if (
      Number.isFinite(parsed.getTime()) &&
      /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      return date.format(parsed);
    }

    return value;
  }
  if (Array.isArray(value)) return `${value.length} elementos relacionados`;
  if (typeof value === "object") return "Información relacionada disponible";

  return String(value);
}

function getPayloadRows(value: Record<string, unknown> | null) {
  if (!value || !Object.keys(value).length) return [];

  return Object.entries(value)
    .filter(
      ([key]) =>
        !["password", "token", "accessToken", "refreshToken"].includes(key),
    )
    .slice(0, 8)
    .map(([key, item]) => ({
      label: humanizeKey(key),
      value: formatPayloadValue(item),
    }));
}

function NotificationRow({
  item,
  canUpdate,
  canDelete,
  onOpen,
  onDelete,
}: {
  item: NotificationItem;
  canUpdate: boolean;
  canDelete: boolean;
  onOpen: (item: NotificationItem) => void;
  onDelete: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const startX = useRef<number | null>(null);
  const skipOpen = useRef(false);
  const [dragX, setDragX] = useState(0);
  const canSwipe = canDelete;

  return (
    <motion.button
      type="button"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
      transition={{ duration: 0.18 }}
      onPointerDown={(event) => {
        if (!canSwipe) return;
        startX.current = event.clientX;
      }}
      onPointerMove={(event) => {
        if (startX.current === null) return;
        setDragX(Math.min(0, Math.max(-104, event.clientX - startX.current)));
      }}
      onPointerUp={() => {
        if (dragX < -72) {
          skipOpen.current = true;
          onDelete(item.id);
        }
        startX.current = null;
        setDragX(0);
      }}
      onPointerCancel={() => {
        startX.current = null;
        setDragX(0);
      }}
      onClick={() => {
        if (skipOpen.current) {
          skipOpen.current = false;
          return;
        }
        if (canUpdate) onOpen(item);
      }}
      className="notification-row group relative block w-full overflow-hidden border-b border-border bg-card text-left last:border-0"
      aria-label={`Abrir notificación ${item.title}`}
    >
      {canDelete ? (
        <span className="absolute inset-y-0 right-0 grid w-24 place-items-center bg-danger/10 text-danger">
          <Trash2 className="h-4 w-4" />
        </span>
      ) : null}
      <span
        className="relative block bg-card p-4 transition-transform group-hover:bg-accent/55"
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <span className="flex items-start gap-3">
          <span className="notification-dot mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_5px_color-mix(in_oklab,var(--primary)_12%,transparent)]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">
              {item.title}
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {item.message}
            </span>
            <span className="mt-2 block text-[10px] uppercase tracking-wide text-muted-foreground">
              {date.format(new Date(item.createdAt))}
            </span>
          </span>
        </span>
      </span>
    </motion.button>
  );
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const canRead = user?.permissions.includes("notificaciones.read") ?? false;
  const canUpdate = user?.permissions.includes("notificaciones.update") ?? false;
  const canDelete = user?.permissions.includes("notificaciones.delete") ?? false;
  const list = useQuery({
    ...notificationsQueryOptions(unreadQuery),
    enabled: canRead && open,
  });
  const count = useQuery({
    ...notificationUnreadQueryOptions(),
    enabled: canRead,
    refetchInterval: 30_000,
  });
  const refreshCount = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
  const refreshList = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  const readOne = useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: (item) => {
      setSelected(item);
      void refreshCount();
    },
  });
  const readAll = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(notificationKeys.list(unreadQuery), {
        data: [],
        pagination: {
          page: 1,
          limit: unreadQuery.limit,
          count: 0,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      queryClient.setQueryData(notificationKeys.unread(), { unread: 0 });
      void refreshList();
    },
  });
  const remove = useMutation({
    mutationFn: notificationsService.delete,
    onSuccess: () => {
      if (selected) setSelected(null);
      void refreshList();
    },
  });

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!canRead) return null;
  const unread = count.data?.unread ?? 0;
  const notifications = list.data?.data ?? [];
  const payloadRows = getPayloadRows(selected?.data ?? null);
  const closeModal = () => {
    setSelected(null);
    void refreshList();
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread ? (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
            {Math.min(unread, 99)}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-primary/5"
            aria-label="Bandeja de notificaciones"
          >
            <header className="flex items-center justify-between border-b border-border bg-gradient-to-b from-primary/5 to-transparent p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-sm font-medium">Notificaciones</h2>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {unread} pendientes
                </p>
              </div>
              {canUpdate && unread ? (
                <button
                  type="button"
                  onClick={() => readAll.mutate()}
                  disabled={readAll.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Leer todas
                </button>
              ) : null}
            </header>
            <div className="max-h-[min(65vh,32rem)] overflow-y-auto overscroll-contain">
              {list.isLoading ? (
                <p className="p-5 text-sm text-muted-foreground">Cargando…</p>
              ) : list.error ? (
                <p role="alert" className="p-5 text-sm text-danger">
                  {list.error.message}
                </p>
              ) : notifications.length ? (
                <AnimatePresence initial={false}>
                  {notifications.map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onOpen={(notification) =>
                        readOne.mutate(notification.id, {
                          onSuccess: (read) => setSelected(read),
                        })
                      }
                      onDelete={(id) => remove.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="grid place-items-center p-8 text-center">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-3 text-sm">Tu bandeja está al día.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mostrando solo notificaciones pendientes.
                  </p>
                </div>
              )}
            </div>
            {canDelete && notifications.length ? (
              <p className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
                Desliza una notificación hacia la izquierda para eliminarla.
              </p>
            ) : null}
          </motion.section>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) =>
              event.target === event.currentTarget && closeModal()
            }
          >
            <motion.section
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="notification-detail-title"
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {formatNotificationType(selected.type)}
                  </p>
                  <h2
                    id="notification-detail-title"
                    className="mt-1 text-lg font-semibold text-foreground"
                  >
                    {selected.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  aria-label="Cerrar notificación"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {selected.message}
              </p>
              <dl className="mt-5 grid gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Recibida</dt>
                  <dd>{date.format(new Date(selected.createdAt))}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Leída</dt>
                  <dd>
                    {selected.readAt
                      ? date.format(new Date(selected.readAt))
                      : "Ahora"}
                  </dd>
                </div>
              </dl>
              {payloadRows.length ? (
                <div className="mt-4 rounded-2xl border border-border bg-muted/35 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Detalles de la operación
                  </p>
                  <dl className="mt-3 grid gap-2">
                    {payloadRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between gap-3 rounded-xl bg-card px-3 py-2 text-sm"
                      >
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd
                          className="max-w-[60%] truncate text-right text-foreground"
                          title={row.value}
                        >
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-border bg-muted/35 p-4 text-sm text-muted-foreground">
                  Esta notificación no trae detalles adicionales para mostrar.
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                {canDelete ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => remove.mutate(selected.id)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                ) : null}
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cerrar
                </Button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
