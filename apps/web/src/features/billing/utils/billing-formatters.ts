import type { BillingCurrency, TransferStatus } from "../types/billing.types";

export function formatBillingMoney(amountMinor: number, currency: BillingCurrency) {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function formatBillingDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const transferStatusLabels: Record<TransferStatus, string> = {
  PENDIENTE_EVIDENCIA: "Falta comprobante",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};
