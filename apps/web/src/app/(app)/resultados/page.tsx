import type { Metadata } from "next";
import { ResultsWorkspace } from "@/features/operations/components/results-workspace";
import { requirePagePermission } from "@/lib/auth/require-page-access";

export const metadata: Metadata = { title: "Resultados | MultiLot 360" };

export default async function Page() {
  await requirePagePermission("resultados.read");
  return <ResultsWorkspace />;
}
