import type {
  BillingCurrency,
  TransferQueueItem,
  TransferQueues,
  TransferStatus,
} from "../types/billing.types";

const statusPriority: Record<TransferStatus, number> = {
  EN_REVISION: 0,
  PENDIENTE_EVIDENCIA: 1,
  RECHAZADA: 2,
  APROBADA: 3,
  CANCELADA: 4,
};

export type ObservedClient = {
  id: string;
  slug: string;
  name: string;
  tenantStatus: string;
  movements: TransferQueueItem[];
  latestMovement: TransferQueueItem;
  attentionCount: number;
  approvedTotals: Record<BillingCurrency, number>;
};

export function allTransferItems(queues: TransferQueues) {
  return (Object.entries(queues) as Array<[TransferStatus, TransferQueueItem[]]>)
    .flatMap(([, items]) => items)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function buildObservedClients(queues: TransferQueues): ObservedClient[] {
  const grouped = new Map<string, TransferQueueItem[]>();

  for (const movement of allTransferItems(queues)) {
    grouped.set(movement.tenant.id, [
      ...(grouped.get(movement.tenant.id) ?? []),
      movement,
    ]);
  }

  return [...grouped.values()]
    .map((movements) => {
      const latestMovement = movements[0];
      return {
        id: latestMovement.tenant.id,
        slug: latestMovement.tenant.slug,
        name: latestMovement.tenant.name,
        tenantStatus: latestMovement.tenant.status,
        movements,
        latestMovement,
        attentionCount: movements.filter((movement) =>
          ["PENDIENTE_EVIDENCIA", "EN_REVISION"].includes(movement.status),
        ).length,
        approvedTotals: movements.reduce<Record<BillingCurrency, number>>(
          (totals, movement) => {
            if (movement.status === "APROBADA") {
              totals[movement.currency] += movement.amountMinor;
            }
            return totals;
          },
          { USD: 0, NIO: 0 },
        ),
      };
    })
    .sort((left, right) => {
      if (left.attentionCount !== right.attentionCount) {
        return right.attentionCount - left.attentionCount;
      }
      return (
        new Date(right.latestMovement.createdAt).getTime() -
        new Date(left.latestMovement.createdAt).getTime()
      );
    });
}

export function primaryClientStatus(client: ObservedClient): TransferStatus {
  return [...client.movements].sort(
    (left, right) => statusPriority[left.status] - statusPriority[right.status],
  )[0].status;
}

export function requestNextAction(status: TransferStatus) {
  switch (status) {
    case "PENDIENTE_EVIDENCIA":
      return {
        owner: "Cliente",
        title: "Adjuntar el comprobante",
        detail: "La solicitud aparecerá para revisión cuando el cliente cargue PDF, JPG o PNG.",
      };
    case "EN_REVISION":
      return {
        owner: "AlphaBy",
        title: "Cotejar el banco y decidir",
        detail: "Confirma monto, moneda, referencia y evidencia antes de aprobar o rechazar.",
      };
    case "APROBADA":
      return {
        owner: "Sistema",
        title: "Cliente activado",
        detail: "El pago quedó en el ledger y el tenant ya puede operar según su suscripción.",
      };
    case "RECHAZADA":
      return {
        owner: "Cliente",
        title: "Corregir y declarar nuevamente",
        detail: "La decisión es inmutable; una corrección debe ingresar como una nueva declaración.",
      };
    case "CANCELADA":
      return {
        owner: "Cliente",
        title: "Iniciar una nueva solicitud si procede",
        detail: "La declaración cancelada permanece en el historial y no requiere revisión.",
      };
  }
}

export function requestProgress(status: TransferStatus) {
  if (status === "PENDIENTE_EVIDENCIA") return 2;
  if (status === "EN_REVISION") return 3;
  return 4;
}
