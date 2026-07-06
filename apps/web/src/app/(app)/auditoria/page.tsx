import type { Metadata } from "next";
import { AuditWorkspace } from "@/features/operations/components/audit-workspace";
import { requirePagePermission } from "@/lib/auth/require-page-access";

export const metadata: Metadata = { title: "Auditoría | MultiLot 360" };

export default async function Page() {
  await requirePagePermission("auditoria.read");
  return <AuditWorkspace />;
}
