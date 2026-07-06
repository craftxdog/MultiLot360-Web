import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Crea tu acceso"
      description="Configura la cuenta administradora inicial. La API puede deshabilitar este registro después del arranque."
    >
      <SignupForm />
    </AuthShell>
  );
}
export const metadata: Metadata = {
  title: "Crear acceso | MultiLot 360",
};
