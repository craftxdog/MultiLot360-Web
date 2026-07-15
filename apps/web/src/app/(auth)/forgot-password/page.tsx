import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordResetFormFromUrl } from "@/features/auth/components/password-reset-form";

export const metadata: Metadata = {
  title: "Recuperar acceso | MultiLot 360",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperación de acceso"
      title="Recupera tu cuenta"
      description="Recibe un código de un solo uso y cierra las sesiones anteriores de forma segura."
    >
      <Suspense fallback={<PasswordResetFormFallback />}>
        <PasswordResetFormFromUrl />
      </Suspense>
    </AuthShell>
  );
}

function PasswordResetFormFallback() {
  return (
    <div
      aria-label="Cargando formulario de recuperación"
      aria-busy="true"
      className="space-y-4"
    >
      <div className="h-[82px] animate-pulse rounded-xl bg-muted/60" />
      <div className="h-[68px] animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
