"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { TMDBEpisode, TMDBSeason } from "@/types/tmdb";

interface EpisodeNavigationProps {
  tvId: number;
  season: number;
  episode: number;
  totalEpisodes: number;
  seasons: TMDBSeason[];
  episodes: TMDBEpisode[];
}

export function EpisodeNavigation({ tvId, season, episode, totalEpisodes, seasons, episodes }: EpisodeNavigationProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const available = seasons.filter(item => item.episode_count > 0).toSorted((a, b) => a.season_number - b.season_number);
  const index = available.findIndex(item => item.season_number === season);
  const previousSeason = index > 0 ? available[index - 1] : undefined;
  const nextSeason = index >= 0 ? available[index + 1] : undefined;
  const hasPrev = episode > 1 || Boolean(previousSeason);
  const hasNext = episode < totalEpisodes || Boolean(nextSeason);
  const href = (s: number, e: number) => `/tv/${tvId}/season/${s}/episode/${e}`;

  return (
    <div className="mt-6 space-y-4" aria-label="Series navigation" aria-busy={pending}>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="min-w-0 text-sm text-white/70">Season
          <select aria-label="Choose season" value={season} disabled={pending} onChange={event => { const selected = Number(event.target.value); if (available.some(item => item.season_number === selected)) startTransition(() => router.push(href(selected, 1))); }} className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-bg px-3 text-base text-white focus:outline-2 focus:outline-red disabled:opacity-50">
            {available.map(item => <option key={item.season_number} value={item.season_number}>{item.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-sm text-white/70">Episode
          <select aria-label="Choose episode" value={episode} disabled={pending} onChange={event => { const selected = Number(event.target.value); if (episodes.some(item => item.episode_number === selected)) startTransition(() => router.push(href(season, selected))); }} className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-bg px-3 text-base text-white focus:outline-2 focus:outline-red disabled:opacity-50">
            {episodes.map(item => <option key={item.episode_number} value={item.episode_number}>{item.episode_number}. {item.name}</option>)}
          </select>
        </label>
      </div>
      {pending && <p role="status" className="text-sm text-white/70">Opening episode…</p>}
      <div className="flex items-center justify-between gap-3">
      {hasPrev ? (
        <Link
          href={episode > 1 ? href(season, episode - 1) : href(previousSeason!.season_number, previousSeason!.episode_count)}
          className="inline-flex min-h-11 items-center gap-2 px-4 py-2 bg-surface border border-border text-white rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </Link>
      ) : (
        <div />
      )}
      {hasNext ? (
        <Link
          href={episode < totalEpisodes ? href(season, episode + 1) : href(nextSeason!.season_number, 1)}
          className="inline-flex min-h-11 items-center gap-2 px-4 py-2 bg-red text-white rounded-lg text-sm hover:bg-red-hover transition-colors"
        >
          {episode < totalEpisodes ? "Next episode" : "Next season"}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
      </div>
    </div>
  );
}
