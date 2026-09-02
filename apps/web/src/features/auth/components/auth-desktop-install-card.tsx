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
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-card shadow-sm">
          <Image
            alt="MultiLot 360"
            className="h-7 w-7 object-contain"
            height={28}
            src="/multilot369logo.png"
            width={28}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium leading-5 text-foreground">
            MultiLot 360 para escritorio
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Instala la aplicación y trabaja en una ventana independiente.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {desktopInstallers.map((installer) => {
          const Icon = installer.icon;

          return (
            <a
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-center text-xs font-medium leading-4 text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              href={installer.href}
              key={installer.label}
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{installer.label}</span>
            </a>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          className="h-[52px] gap-2 px-2.5 text-center text-xs leading-4"
          disabled={installed || !prompt}
          onClick={install}
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>
            {installed
              ? "PWA instalada"
              : prompt
                ? "Instalar PWA"
                : "PWA en navegador"}
          </span>
        </Button>
      </div>
    </section>
  );
}
