"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type InstallChoice = "accepted" | "dismissed";
interface InstallPrompt extends Event {
  prompt(): Promise<unknown>;
  userChoice: Promise<{ outcome: InstallChoice }>;
}
interface PwaState {
  canInstall: boolean;
  installed: boolean;
  workerError: boolean;
  install: () => Promise<InstallChoice | null>;
}
const PwaContext = createContext<PwaState | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [workerError, setWorkerError] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const syncStandalone = () => setInstalled(standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const timer = window.setTimeout(syncStandalone, 0);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => { setPrompt(null); setInstalled(true); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    standalone.addEventListener("change", syncStandalone);

    if ("serviceWorker" in navigator) {
      // A new script at the same root scope replaces the legacy advertising worker.
      void navigator.serviceWorker.register("/pwa-sw.js", { scope: "/", updateViaCache: "none" }).catch(() => setWorkerError(true));
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      standalone.removeEventListener("change", syncStandalone);
    };
  }, []);

  const install = async () => {
    if (!prompt) return null;
    setPrompt(null);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      return outcome;
    } catch {
      return null;
    }
  };

  return <PwaContext.Provider value={{ canInstall: Boolean(prompt), installed, workerError, install }}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error("usePwa must be used within PwaProvider");
  return context;
}
