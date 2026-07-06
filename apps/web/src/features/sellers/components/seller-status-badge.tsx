import { cn } from "@/lib/utils";

type SellerStatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  PENDIENTE:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  USADO:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  EXPIRADO: "border-border bg-muted text-muted-foreground",
  REVOCADO:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200",
};

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  USADO: "Activada",
  EXPIRADO: "Expirada",
  REVOCADO: "Revocada",
};

export function SellerStatusBadge({ status }: SellerStatusBadgeProps) {
  const normalized = status.toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium",
        statusStyles[normalized] ??
        "border-border bg-muted text-muted-foreground",
      )}
    >
      {statusLabels[normalized] ?? normalized}
    </span>
  );
}
