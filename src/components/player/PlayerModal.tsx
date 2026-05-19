"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { MOVIE_SOURCES, TV_SOURCES } from "@/lib/sources";
import { PreRollCountdown } from "./PreRollCountdown";

interface PlayerModalProps {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

export function PlayerModal({ tmdbId, type, season, episode }: PlayerModalProps) {
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);

  const seasonNumber = season || 1;
  const episodeNumber = episode || 1;

  const sources = useMemo(
    () =>
      type === "movie"
        ? MOVIE_SOURCES.map((s) => ({ ...s, url: s.url(tmdbId) }))
        : TV_SOURCES.map((s) => ({ ...s, url: s.url(tmdbId, seasonNumber, episodeNumber) })),
    [episodeNumber, seasonNumber, tmdbId, type]
  );

  const currentSource = sources[sourceIndex] || sources[0];

  // Route through proxy so the blocker script is injected before provider scripts run.
  // The proxy serves raw HTML from our origin — no sandbox needed, no sandbox detection.
  const proxiedUrl = `/api/player-proxy?url=${encodeURIComponent(currentSource.url)}`;

  const handleCountdownComplete = useCallback(() => {
    setReady(true);
  }, []);

  const handleSourceSwitch = useCallback((index: number) => {
    setSourceIndex(index);
  }, []);

  // Last-resort safety net: if anything slips past the proxy blocker and tries
  // to navigate the top frame, the browser shows "Leave site?" instead of redirecting silently.
  useEffect(() => {
    if (!ready) return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [ready]);

  return (
    <div className="w-full">
      {!started ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-border bg-surface px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red text-white">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white">
            Ready to Watch
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            The player loads only when you start it, which keeps aggressive providers quiet until
            you actually want playback.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-5 rounded-lg bg-red px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-hover"
          >
            Start Player
          </button>
        </div>
      ) : !ready ? (
        <PreRollCountdown onComplete={handleCountdownComplete} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <button
                key={source.name}
                onClick={() => handleSourceSwitch(index)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  index === sourceIndex
                    ? "bg-red text-white"
                    : "border border-border bg-surface text-muted hover:text-white"
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              key={proxiedUrl}
              src={proxiedUrl}
              title={`${type === "movie" ? "Movie" : "Episode"} player via ${currentSource.name}`}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="mt-2 text-center text-xs text-muted">
            Ads blocked. If a source doesn&apos;t work, try switching to another.
          </p>
        </>
      )}
    </div>
  );
}
