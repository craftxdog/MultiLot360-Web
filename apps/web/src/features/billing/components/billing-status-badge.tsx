import type { TransferStatus } from "../types/billing.types";
import { transferStatusLabels } from "../utils/billing-formatters";
import { cn } from "@/lib/utils";

const styles: Record<TransferStatus, string> = {
  PENDIENTE_EVIDENCIA: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  EN_REVISION: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  APROBADA: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  RECHAZADA: "border-danger/20 bg-danger/10 text-danger",
  CANCELADA: "border-border bg-muted text-muted-foreground",
};

export function BillingStatusBadge({ status }: { status: TransferStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", styles[status])}>
      {transferStatusLabels[status]}
    </span>
  );
}
