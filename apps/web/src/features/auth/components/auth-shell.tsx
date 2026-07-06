import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AuthVisualPanel } from "./auth-visual-panel";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow = "Acceso seguro",
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative flex h-12 items-center justify-center border-b border-border bg-card px-4 pr-36 text-center text-xs text-muted-foreground sm:pr-40">
        <LockKeyhole className="mr-2 h-3.5 w-3.5" />
        Acceso privado · Las credenciales se procesan únicamente en el servidor
        <div className="absolute right-3 top-1.5">
          <ThemeToggle />
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-48px)] lg:grid-cols-[1.04fr_0.96fr]">
        <AuthVisualPanel />

        <section className="relative flex min-h-[calc(100vh-48px)] items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute left-6 top-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
              <span className="font-serif text-sm">M</span>
            </div>
            <span className="text-sm text-foreground">MultiLot 360</span>
          </div>

          <MotionReveal className="w-full max-w-md" delay={0.04}>
            <div className="mb-8 text-center">
              <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="font-serif text-[30px] leading-tight tracking-[-0.025em] text-foreground">
                {title}
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_22px_70px_-42px_rgba(0,0,0,0.45)] sm:p-6">
              {children}
            </div>

            <p className="mt-8 text-center text-[11px] leading-5 text-muted-foreground">
              La sesión usa cookies seguras y no expone tokens a JavaScript.
            </p>
          </MotionReveal>
        </section>
      </div>
    </main>
  );
}
