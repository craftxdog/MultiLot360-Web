import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SellerActivationFormFromUrl } from "@/features/auth/components/seller-access-form";

export default function SellerActivationPage() {
  return (
    <AuthShell
      title="Activa tu acceso"
      description="Confirma la invitación enviada por tu administrador y crea tu contraseña segura."
    >
      <Suspense fallback={<SellerActivationFallback />}>
        <SellerActivationFormFromUrl />
      </Suspense>
    </AuthShell>
  );
}

function SellerActivationFallback() {
  return (
    <div aria-label="Cargando activación segura" aria-busy="true" className="space-y-4">
      <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Activar vendedor | MultiLot 360",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
