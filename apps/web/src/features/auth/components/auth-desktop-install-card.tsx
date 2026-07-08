"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, Laptop, MonitorDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const releaseBaseUrl = (
  process.env.NEXT_PUBLIC_DESKTOP_RELEASE_URL ??
  "https://github.com/craftxdog/MultiLot360-Web/releases/latest/download"
).replace(/\/$/, "");

const desktopInstallers = [
  {
    href:
      process.env.NEXT_PUBLIC_DESKTOP_MAC_ARM_URL ??
      process.env.NEXT_PUBLIC_DESKTOP_MAC_URL ??
      `${releaseBaseUrl}/MultiLot-360-macOS-arm64.dmg`,
    icon: Laptop,
    label: "macOS Apple Silicon",
  },
  {
    href:
      process.env.NEXT_PUBLIC_DESKTOP_MAC_INTEL_URL ??
      process.env.NEXT_PUBLIC_DESKTOP_MAC_X64_URL ??
      `${releaseBaseUrl}/MultiLot-360-macOS-x64.dmg`,
    icon: Laptop,
    label: "macOS Intel",
  },
  {
    href:
      process.env.NEXT_PUBLIC_DESKTOP_WINDOWS_URL ??
      `${releaseBaseUrl}/MultiLot-360-Windows-x64-Setup.exe`,
    icon: MonitorDown,
    label: "Windows",
  },
];

export function AuthDesktopInstallCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const syncInstalledState = () => {
      setInstalled(
        standaloneQuery.matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      );
    };

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    const frameId = window.requestAnimationFrame(syncInstalledState);
    standaloneQuery.addEventListener("change", syncInstalledState);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.cancelAnimationFrame(frameId);
      standaloneQuery.removeEventListener("change", syncInstalledState);
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
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-card shadow-sm">
          <Image
            alt="MultiLot 360"
            className="h-8 w-8 object-contain"
            height={32}
            src="/multilot369logo.png"
            width={32}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium text-foreground">
            MultiLot 360 para escritorio
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Descarga el instalador nativo para macOS o Windows. Abre tu
            operación en una ventana propia y, si el release no trae URL fija,
            te pedirá la dirección del sistema al iniciar.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {desktopInstallers.map((installer) => {
              const Icon = installer.icon;

              return (
                <a
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                  href={installer.href}
                  key={installer.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {installer.label}
                </a>
              );
            })}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 h-9 gap-2"
            disabled={installed || !prompt}
            onClick={install}
          >
            <Download className="h-3.5 w-3.5" />
            {installed
              ? "Web instalada"
              : prompt
                ? "Instalar web/PWA"
                : "Web/PWA disponible desde navegador"}
          </Button>
        </div>
      </div>
    </section>
  );
}
