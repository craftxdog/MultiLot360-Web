import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => typeof value === "string" && params.set(key, value));
  params.set("view", "blocked");
  redirect(`${routes.numberControl}?${params.toString()}`);
}
