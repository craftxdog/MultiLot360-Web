import type { Metadata } from "next";
import { DrawsPage } from "@/features/draws/components/draws-page";

export const metadata: Metadata = {
  title: "Turnos | MultiLot 360",
};

export default function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <DrawsPage
      defaultView="active"
      requiredPermissions={["turnos.read", "sorteos.read"]}
      searchParams={searchParams}
    />
  );
}
