"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

type AuthErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AuthError({ error, unstable_retry }: AuthErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-[0_22px_70px_-42px_rgba(0,0,0,0.45)]">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-danger/20 bg-danger/8 text-danger">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h1 className="mt-5 font-serif text-2xl">No pudimos cargar el acceso</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          La conexión se interrumpió temporalmente. Puedes intentarlo nuevamente
          sin perder el flujo de recuperación.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={unstable_retry} className="gap-2">
            <RotateCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Link
            href={routes.login}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-medium transition hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-5 font-mono text-[10px] text-muted-foreground">
            Referencia: {error.digest}
          </p>
        ) : null}
      </section>
    </main>
  );
}
