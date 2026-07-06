import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordResetForm } from "@/features/auth/components/password-reset-form";

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
      <PasswordResetForm />
    </AuthShell>
  );
}
