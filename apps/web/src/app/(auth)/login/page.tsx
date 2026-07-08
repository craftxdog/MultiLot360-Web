import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthDesktopInstallCard } from "@/features/auth/components/auth-desktop-install-card";
import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Bienvenido a MultiLot"
      description="Accede al centro operativo con tu cuenta o activa una invitación de vendedor."
    >
      <LoginForm next={params?.next} />
      <AuthDesktopInstallCard />
    </AuthShell>
  );
}
export const metadata: Metadata = {
  title: "Iniciar sesión | MultiLot 360",
};
