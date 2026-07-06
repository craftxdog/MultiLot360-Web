import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SellerAccessForm } from "@/features/auth/components/seller-access-form";

type SellerActivationPageProps = {
  searchParams: Promise<{
    email?: string;
    code?: string;
    next?: string;
  }>;
};

export default async function SellerActivationPage({
  searchParams,
}: SellerActivationPageProps) {
  const params = await searchParams;
  const accessCode = params.code?.replace(/\D/g, "").slice(0, 6);

  return (
    <AuthShell
      title="Activa tu acceso"
      description="Confirma la invitación enviada por tu administrador y crea tu contraseña segura."
    >
      <SellerAccessForm
        next={params.next}
        initialEmail={params.email?.trim().toLowerCase()}
        initialAccessCode={accessCode}
        sanitizeActivationUrl
      />
    </AuthShell>
  );
}

export const metadata: Metadata = {
  title: "Activar vendedor | MultiLot 360",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
