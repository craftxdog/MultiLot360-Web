import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordResetConfirmFormFromUrl } from "@/features/auth/components/password-reset-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña | MultiLot 360",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Nueva contraseña"
      title="Restablece tu acceso"
      description="Usa el enlace seguro o el código temporal de respaldo para crear una contraseña nueva."
    >
      <Suspense fallback={<PasswordResetConfirmFallback />}>
        <PasswordResetConfirmFormFromUrl />
      </Suspense>
    </AuthShell>
  );
}

function PasswordResetConfirmFallback() {
  return (
    <div
      aria-label="Cargando formulario de restablecimiento"
      aria-busy="true"
      className="space-y-4"
    >
      <div className="h-[68px] animate-pulse rounded-xl bg-muted/60" />
      <div className="h-[68px] animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
