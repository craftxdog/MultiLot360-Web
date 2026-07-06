export type RealtimeStatus = "connecting" | "connected" | "reconnecting" | "offline";

export type RealtimeReady = {
  protocolVersion: 1;
  userId: string;
  roleName: string;
  sellerId: string | null;
  modules: string[];
  serverTime: string;
};

export type RealtimeEnvelope<T = unknown> = {
  id: string;
  name: string;
  aggregateId?: string;
  occurredAt: string;
  version: 1;
  payload: T;
};
