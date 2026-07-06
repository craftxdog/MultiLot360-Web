"use client";

import { useEffect, useState } from "react";
import { Download, MonitorDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function DesktopInstallCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
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

  return <section className="rounded-3xl border border-border bg-card p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><MonitorDown className="h-5 w-5" /></span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">MultiLot 360 para escritorio</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Instálalo como app en macOS o Windows desde Chrome/Edge. Mantiene la sesión, abre en ventana propia y no añade peso de Electron.</p>
        </div>
      </div>
      <Button type="button" variant="secondary" className="h-11 gap-2" disabled={installed || !prompt} onClick={install}>
        <Download className="h-4 w-4" />{installed ? "Instalado" : prompt ? "Instalar app" : "Disponible desde navegador"}
      </Button>
    </div>
  </section>;
}
