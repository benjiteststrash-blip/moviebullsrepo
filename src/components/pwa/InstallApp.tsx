"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePwa } from "./PwaProvider";

export function InstallApp() {
  const { canInstall, installed, workerError, install } = usePwa();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleInstall() {
    setBusy(true);
    const choice = await install();
    setBusy(false);
    setMessage(choice === "dismissed" ? "Installation cancelled. You can still install from your browser’s menu." : choice === null ? "Use your browser’s install option below." : "Moviebulls is ready. Look for its icon on your home screen or in your apps.");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-28 sm:px-6">
      <Image src="/icons/icon-192.png" width={80} height={80} alt="Moviebulls app icon" priority className="mb-6 rounded-2xl" />
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-red">Moviebulls on your device</p>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Your next watch. One tap away.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-gray-300">Add Moviebulls to your home screen and open it in its own app window. Your watchlist stays on this device.</p>

      {installed ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="font-semibold text-white">Moviebulls is installed or already open as an app.</p>
          <Link href="/movies" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-red px-6 text-sm font-semibold text-white hover:bg-red-hover">Explore movies</Link>
        </div>
      ) : (
        <>
          {canInstall && <button type="button" onClick={handleInstall} disabled={busy} className="mt-7 min-h-12 rounded-full bg-red px-7 text-sm font-bold text-white hover:bg-red-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red disabled:opacity-60">{busy ? "Opening installation…" : "Install Moviebulls"}</button>}
          <p className="mt-4 text-sm text-muted" role="status">{message || (canInstall ? "Install directly, or use the instructions below." : "Use the installation option in your browser. If you opened this inside another app, open it in Safari, Chrome, or Edge first.")}</p>
          <div className="mt-8 divide-y divide-border border-y border-border">
            <section className="py-5">
              <h2 className="font-semibold text-white">Android · Chrome</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">Open the browser menu, choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</p>
            </section>
            <section className="py-5">
              <h2 className="font-semibold text-white">iPhone & iPad · Safari</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>. Keep <strong>Open as Web App</strong> on if shown, then tap <strong>Add</strong>.</p>
            </section>
            <section className="py-5">
              <h2 className="font-semibold text-white">Computer · Chrome or Edge</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">Use the install icon in the address bar, or the app installation option in the browser menu.</p>
            </section>
          </div>
        </>
      )}
      {workerError && <p className="mt-4 text-sm text-muted" role="status">Offline setup couldn’t finish. Please reload while connected to the internet.</p>}
      <p className="mt-6 text-sm leading-6 text-muted">An internet connection is needed to browse and stream. Installing Moviebulls does not download movies.</p>
    </div>
  );
}
