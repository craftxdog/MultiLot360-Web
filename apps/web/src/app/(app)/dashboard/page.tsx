import type { Metadata } from "next";
import { DashboardWorkspace } from "@/features/dashboard/components/dashboard-workspace";

export const metadata: Metadata = { title: "Dashboard | MultiLot 360" };

export default function DashboardPage() {
  return <DashboardWorkspace />;
}
