import type { Metadata } from "next";
import { PrizesWorkspace } from "@/features/operations/components/prizes-workspace";
import { requirePagePermission } from "@/lib/auth/require-page-access";

export const metadata: Metadata = { title: "Premios | MultiLot 360" };

export default async function Page() {
  await requirePagePermission("pagos_premios.read");
  return <PrizesWorkspace />;
}
