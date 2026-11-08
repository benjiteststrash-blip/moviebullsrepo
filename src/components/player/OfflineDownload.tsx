"use client";

import { useEffect, useRef, useState } from "react";
import { formatBytes, listDownloads, saveDownload } from "../../../public/offline/store.mjs";

export function OfflineDownload({ sourceUrl, id, title }: { sourceUrl: string; id: string; title: string }) {
  const [progress, setProgress] = useState<{ done: number; total: number; bytes: number } | null>(null);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const saving = progress !== null;

  useEffect(() => {
    let active = true;
    if ("caches" in window) void listDownloads().then(items => { if (active) setSaved(items.some(item => item.id === id && item.status === "ready")); }).catch(() => {});
    return () => { active = false; controller.current?.abort(); };
  }, [id]);

  useEffect(() => {
    if (!saving) return;
    const preventClose = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventClose);
    return () => window.removeEventListener("beforeunload", preventClose);
  }, [saving]);

  async function save() {
    if (!sourceUrl || controller.current) return;
    if (!("caches" in window) || !("serviceWorker" in navigator)) { setMessage("Offline downloads are not supported in this browser. Try the installed app in Chrome or Safari."); return; }
    const abort = new AbortController();
    controller.current = abort;
    setMessage("");
    setProgress({ done: 0, total: 0, bytes: 0 });
    try {
      // Ask to retain downloads under storage pressure; browsers may decline.
      await navigator.storage?.persist?.().catch(() => false);
      await saveDownload(sourceUrl, { id, title }, { signal: abort.signal, onProgress: setProgress });
      setSaved(true);
      setMessage("Saved. Open Downloads to watch without an internet connection.");
    } catch (error) {
      setMessage(abort.signal.aborted ? "Download cancelled. No partial video was kept." : error instanceof Error ? error.message : "Download failed. Reload the player and try again.");
    } finally { controller.current = null; setProgress(null); }
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-3">
        {saved ? <span className="text-sm text-white">Saved on this device</span> : <button type="button" onClick={() => void save()} disabled={!sourceUrl || Boolean(progress)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red px-4 text-sm font-semibold text-white hover:bg-red-hover disabled:cursor-not-allowed disabled:opacity-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" /></svg>
          {progress ? "Saving…" : "Save offline"}
        </button>}
        {progress && <button type="button" onClick={() => controller.current?.abort()} className="min-h-11 px-3 text-sm text-white underline underline-offset-4">Cancel</button>}
        <a href="/downloads.html" className="inline-flex min-h-11 items-center px-1 text-sm text-white underline underline-offset-4">Downloads</a>
      </div>
      {progress ? <div className="mt-3 max-w-lg"><progress aria-label="Saving video" className="h-2 w-full accent-red" max={progress.total || 1} value={progress.done} /><p role="status" className="mt-2 text-sm text-white/70">{progress.total ? `${Math.floor(progress.done / progress.total * 100)}% · ${formatBytes(progress.bytes)}` : "Checking this video…"} Keep this page open until saving finishes.</p></div> : <p className="mt-2 text-sm text-white/70">{saved ? "Available on this device. External subtitles are not saved." : sourceUrl ? "Save this video on this device. Keep the app open while it downloads." : "Start playback to check whether this video can be saved."}</p>}
      {message && <p role="status" className="mt-2 text-sm text-white/80">{message}</p>}
    </div>
  );
}
