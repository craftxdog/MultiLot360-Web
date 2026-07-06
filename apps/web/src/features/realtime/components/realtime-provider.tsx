"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { env } from "@/config/env";
import type { RealtimeEnvelope, RealtimeReady, RealtimeStatus } from "../types/realtime.types";

const RealtimeContext = createContext<{ status: RealtimeStatus; ready: RealtimeReady | null }>({
  status: "connecting",
  ready: null,
});

const queryRootsByEvent: Array<[prefix: string, roots: string[]]> = [
  ["draws.", ["draws", "sales", "sales-matrix", "reports"]],
  ["number-limits.", ["number-control", "sales", "sales-matrix"]],
  ["blocked-numbers.", ["number-control", "sales", "sales-matrix"]],
  ["sales.", ["sales", "sales-matrix", "reports", "cash-cuts", "results"]],
  ["results.", ["results", "prize-payments", "reports"]],
  ["prize-payments.", ["prize-payments", "results", "reports", "cash-cuts"]],
  ["cash-cuts.", ["cash-cuts", "reports"]],
  ["parameters.", ["parameters", "sales"]],
  ["notifications.", ["notifications"]],
];

async function getRealtimeToken() {
  const response = await fetch("/api/auth/realtime-token", {
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("No realtime session");
  return (await response.json()) as { accessToken: string };
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const [ready, setReady] = useState<RealtimeReady | null>(null);
  const pendingRoots = useRef(new Set<string>());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let disposed = false;
    let socket: ReturnType<typeof io> | null = null;

    const queueInvalidation = (eventName: string) => {
      const roots = queryRootsByEvent.find(([prefix]) => eventName.startsWith(prefix))?.[1] ?? [];
      roots.forEach((root) => pendingRoots.current.add(root));
      if (flushTimer.current) return;
      flushTimer.current = setTimeout(() => {
        const queued = new Set(pendingRoots.current);
        pendingRoots.current.clear();
        flushTimer.current = null;
        void queryClient.invalidateQueries({
          predicate: (query) => queued.has(String(query.queryKey[0])),
          refetchType: "active",
        });
      }, 80);
    };

    const connect = async () => {
      try {
        const { accessToken } = await getRealtimeToken();
        if (disposed) return;
        socket = io(`${env.realtimeUrl}/realtime`, {
          path: "/socket.io",
          auth: { token: accessToken },
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionDelayMax: 5_000,
          timeout: 8_000,
        });
        socket.on("connect", () => setStatus("connected"));
        socket.on("disconnect", () => setStatus("reconnecting"));
        socket.on("connect_error", () => setStatus("offline"));
        socket.io.on("reconnect_attempt", () => setStatus("reconnecting"));
        socket.io.on("reconnect", () => {
          setStatus("connected");
          void queryClient.refetchQueries({ type: "active" });
        });
        socket.on("realtime.ready", (session: RealtimeReady) => setReady(session));
        socket.onAny((name: string, envelope: RealtimeEnvelope) => {
          if (name !== "realtime.ready" && envelope?.version === 1) queueInvalidation(name);
        });
      } catch {
        if (!disposed) setStatus("offline");
      }
    };

    void connect();
    return () => {
      disposed = true;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      socket?.disconnect();
    };
  }, [queryClient]);

  return <RealtimeContext.Provider value={{ status, ready }}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
