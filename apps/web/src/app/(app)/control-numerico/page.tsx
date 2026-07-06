import type { Metadata } from "next";
import { NumberControlPage } from "@/features/number-control/components/number-control-page";

export const metadata: Metadata = { title: "Control numérico | MultiLot 360" };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <NumberControlPage defaultView="limits" searchParams={searchParams} />;
}
