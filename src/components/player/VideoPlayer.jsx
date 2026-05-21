'use client';

import { useCallback, useMemo, useState } from 'react';
import { MOVIE_SOURCES, TV_SOURCES } from '@/lib/sources';

export function VideoPlayer({ tmdb, type = 'movie', season = 1, episode = 1, title }) {
  const [started, setStarted] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  const source = useMemo(() => {
    const sourceList = type === 'movie' ? MOVIE_SOURCES : TV_SOURCES;
    const selected = sourceList[0];
    const url = type === 'movie'
      ? selected.url(tmdb)
      : selected.url(tmdb, season || 1, episode || 1);

    return { ...selected, url };
  }, [episode, season, tmdb, type]);

  const playerUrl = `/api/player-proxy?url=${encodeURIComponent(source.url)}&preserveLocation=1&blocker=1`;

  const handleStartPlayer = useCallback(() => {
    setStarted(true);
    setIframeLoading(true);
  }, []);

  return (
    <div className="w-full">
      {!started ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-border bg-surface px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red text-white">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white">Ready to Watch</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            {title || `${type === 'movie' ? 'Movie' : 'Show'} loaded when you start.`}
          </p>
          <button
            type="button"
            onClick={handleStartPlayer}
            className="mt-5 rounded-lg bg-red px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-hover"
          >
            Start Player
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-lg bg-red px-3 py-2 text-sm font-medium text-white">
              {source.name}
            </span>
            <span className="text-xs text-muted">Protected</span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              key={playerUrl}
              src={playerUrl}
              title={`${type === 'movie' ? 'Movie' : 'Episode'} player via ${source.name}`}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="origin"
              onLoad={() => setIframeLoading(false)}
            />

            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-red" />
                <p className="text-sm text-muted">Loading VidSrc Wiki...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
