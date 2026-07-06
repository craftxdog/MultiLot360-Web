import type { Metadata } from "next";
import { SalesPage } from "@/features/sales/components/sales-page";

export const metadata: Metadata = { title: "Ventas | MultiLot 360" };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <SalesPage defaultView="sell" searchParams={searchParams} />;
}
