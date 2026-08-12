import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@multilot/api-client";
import { ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { BillingPortalWorkspace } from "@/features/billing/components/billing-portal-workspace";
import { billingApi } from "@/features/billing/server/billing-api";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Suscripción y facturación | MultiLot 360" };
export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const token = await getAccessToken();
  if (!token) redirect(`${routes.login}?next=${encodeURIComponent(routes.subscription)}`);

  let portal;
  let accessError: unknown;
  try {
    portal = await billingApi.portal(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`${routes.login}?reauth=1&next=${encodeURIComponent(routes.subscription)}`);
    }
    accessError = error;
  }

  if (portal) return <BillingPortalWorkspace initialPortal={portal} />;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Portal de facturación restringido</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        {accessError instanceof Error ? accessError.message : "Tu membresía no tiene acceso a la facturación de esta empresa."}
      </p>
    </div>
  );
}
