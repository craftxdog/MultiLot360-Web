import type { Metadata } from "next";
import { ApiError } from "@multilot/api-client";
import { ShieldCheck } from "lucide-react";
import { PlatformControlCenter } from "@/features/billing/components/platform-control-center";
import { billingApi } from "@/features/billing/server/billing-api";
import type { TransferQueues, TransferStatus } from "@/features/billing/types/billing.types";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Centro de control SaaS | MultiLot 360" };
export const dynamic = "force-dynamic";

const statuses: TransferStatus[] = ["PENDIENTE_EVIDENCIA", "EN_REVISION", "APROBADA", "RECHAZADA", "CANCELADA"];

export default async function PlatformPage() {
  const token = await getAccessToken();
  let queues: TransferQueues | undefined;
  let accessError: unknown;

  try {
    if (!token) throw new ApiError("Sesión no disponible", { status: 401 });
    const results = await Promise.all(statuses.map((status) => billingApi.transferQueue(status, 200, token)));
    queues = Object.fromEntries(statuses.map((status, index) => [status, results[index]])) as TransferQueues;
  } catch (error) {
    accessError = error;
  }

  if (queues) return <PlatformControlCenter queues={queues} />;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Control financiero de plataforma</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{accessError instanceof Error ? accessError.message : "Se requiere un administrador financiero AlphaBy activo."}</p>
    </div>
  );
}
