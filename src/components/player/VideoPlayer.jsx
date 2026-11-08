'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MOVIE_SOURCES, TV_SOURCES } from '@/lib/sources';
import { recordRecentlyWatched } from '@/hooks/useRecentlyWatched';
import { OfflineDownload } from './OfflineDownload';

/** @param {{tmdb: number, type?: 'movie' | 'tv', season?: number, episode?: number, title?: string, posterPath?: string | null, historyTitle?: string}} props */
export function VideoPlayer({ tmdb, type = 'movie', season = 1, episode = 1, title, posterPath = null, historyTitle = '' }) {
  const [started, setStarted] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [playerError, setPlayerError] = useState('');
  const [offlineSource, setOfflineSource] = useState('');
  const iframeRef = useRef(null);
  const recordedRef = useRef(false);
  const playerOrigin = process.env.NEXT_PUBLIC_PLAYER_ORIGIN?.replace(/\/$/, '');

  const source = useMemo(() => {
    const sourceList = type === 'movie' ? MOVIE_SOURCES : TV_SOURCES;
    const selected = sourceList[0];
    const url = type === 'movie'
      ? selected.url(tmdb)
      : selected.url(tmdb, season || 1, episode || 1);

    return { ...selected, url };
  }, [episode, season, tmdb, type]);

  const playerUrl = playerOrigin ? `${playerOrigin}${source.url}` : '';

  useEffect(() => {
    if (!started || !playerOrigin) return;
    const receive = (event) => {
      if (event.origin !== playerOrigin || event.source !== iframeRef.current?.contentWindow || event.data?.type !== 'moviebulls-player') return;
      if (event.data.state === 'source') {
        try {
          const url = new URL(event.data.url);
          if (url.protocol === 'https:' && !url.username && !url.password && url.href.length <= 16000) setOfflineSource(url.href);
        } catch { /* Ignore invalid source messages. */ }
        return;
      }
      if (event.data.state === 'playing' && !recordedRef.current) {
        recordedRef.current = true;
        recordRecentlyWatched({ tmdb_id: tmdb, type, title: historyTitle || title || (type === 'movie' ? 'Movie' : 'TV show'), poster_path: posterPath, ...(type === 'tv' ? { season, episode } : {}) });
      }
      if (['ready', 'playing', 'unavailable'].includes(event.data.state)) clearTimeout(timeout);
      if (event.data.state === 'unavailable') {
        setOfflineSource('');
        setIframeLoading(false);
        setPlayerError('This title is temporarily unavailable. Please try again.');
      } else if (['ready', 'playing'].includes(event.data.state)) {
        setIframeLoading(false);
        setPlayerError('');
      }
    };
    window.addEventListener('message', receive);
    const timeout = setTimeout(() => {
      setIframeLoading(false);
      setPlayerError('The player is taking longer than usual. You can try loading it again.');
    }, 45000);
    return () => { window.removeEventListener('message', receive); clearTimeout(timeout); };
  }, [started, playerOrigin, playerUrl, attempt, tmdb, type, title, historyTitle, posterPath, season, episode]);

  const handleStartPlayer = useCallback(() => {
    recordedRef.current = false;
    setStarted(true);
    setIframeLoading(true);
    setPlayerError('');
    setOfflineSource('');
    setAttempt(value => value + 1);
  }, []);

  return (
    <div className="w-full">
      {!started || !playerUrl ? (
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
            disabled={!playerUrl}
            className="mt-5 rounded-lg bg-red px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-hover"
          >
            {playerUrl ? 'Start Player' : 'Player temporarily unavailable'}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-lg bg-red px-3 py-2 text-sm font-medium text-white">
              {source.name}
            </span>
            <button type="button" onClick={handleStartPlayer} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-white">Reload player</button>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              key={`${playerUrl}:${attempt}`}
              ref={iframeRef}
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
          {playerError && <p role="status" className="mt-3 text-sm text-muted">{playerError}</p>}
        </>
      )}
      <OfflineDownload sourceUrl={offlineSource} id={type === 'movie' ? `movie-${tmdb}` : `tv-${tmdb}-${season}-${episode}`} title={title || historyTitle || (type === 'movie' ? 'Movie' : `Episode ${episode}`)} />
    </div>
  );
}
