import { cn } from "@/lib/utils";
import type { SaleStatus } from "../types/sales.types";

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", status === "ACTIVA" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300")}>{status === "ACTIVA" ? "Activa" : "Anulada"}</span>;
}
