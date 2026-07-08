"use client";

import { useEffect, useState } from "react";
import { Download, MonitorDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function AuthDesktopInstallCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    );
  });

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;

    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setPrompt(null);
  };

  return (
    <section className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MonitorDown className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium text-foreground">
            MultiLot 360 para escritorio
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Instálalo en macOS o Windows desde Chrome/Edge para abrirlo en una
            ventana propia sin añadir peso extra al sistema.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 h-9 gap-2"
            disabled={installed || !prompt}
            onClick={install}
          >
            <Download className="h-3.5 w-3.5" />
            {installed
              ? "Instalado"
              : prompt
                ? "Instalar app"
                : "Disponible desde navegador"}
          </Button>
        </div>
      </div>
    </section>
  );
}
