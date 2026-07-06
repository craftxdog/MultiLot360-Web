import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default async function DrawConfigurationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = new URLSearchParams({ view: "configurations" });

  Object.entries(rawParams).forEach(([key, value]) => {
    if (key !== "view" && typeof value === "string") params.set(key, value);
  });

  redirect(`${routes.shifts}?${params.toString()}`);
}
