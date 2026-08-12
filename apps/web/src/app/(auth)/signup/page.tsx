import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";
import { billingApi } from "@/features/billing/server/billing-api";

export default async function SignupPage() {
  const plans = await billingApi.plans("BANK_TRANSFER").catch(() => []);

  return (
    <AuthShell
      wide
      eyebrow="Alta SaaS"
      title="Crea una empresa lista para operar."
      description="Elige el plan, registra al propietario y completa el pago desde un portal aislado para tu empresa."
    >
      <SignupForm plans={plans} />
    </AuthShell>
  );
}
export const metadata: Metadata = {
  title: "Crear empresa | MultiLot 360",
};
