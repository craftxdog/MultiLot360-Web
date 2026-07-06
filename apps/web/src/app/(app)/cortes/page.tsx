import type { Metadata } from "next";
import { CutsWorkspace } from "@/features/operations/components/cuts-workspace";
import { requirePagePermission } from "@/lib/auth/require-page-access";

export const metadata: Metadata = { title: "Cortes | MultiLot 360" };

export default async function Page() {
  await requirePagePermission("cortes.read");
  return <CutsWorkspace />;
}
