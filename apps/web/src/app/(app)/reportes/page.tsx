import type { Metadata } from "next";
import { ReportsWorkspace } from "@/features/operations/components/reports-workspace";
import { requirePagePermission } from "@/lib/auth/require-page-access";

export const metadata: Metadata = { title: "Reportes | MultiLot 360" };

export default async function Page() {
  await requirePagePermission("ventas.read");
  return <ReportsWorkspace />;
}
