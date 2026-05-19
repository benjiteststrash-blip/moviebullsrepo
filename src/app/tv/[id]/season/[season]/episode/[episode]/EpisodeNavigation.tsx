"use client";

import Link from "next/link";

interface EpisodeNavigationProps {
  tvId: number;
  season: number;
  episode: number;
  totalEpisodes: number;
}

export function EpisodeNavigation({ tvId, season, episode, totalEpisodes }: EpisodeNavigationProps) {
  const hasPrev = episode > 1;
  const hasNext = episode < totalEpisodes;

  return (
    <div className="flex items-center justify-between mt-8">
      {hasPrev ? (
        <Link
          href={`/tv/${tvId}/season/${season}/episode/${episode - 1}`}
          className="inline-flex items-center gap-2 px-5 py-2 bg-surface border border-border text-white rounded-full text-sm hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous Episode
        </Link>
      ) : (
        <div />
      )}
      {hasNext ? (
        <Link
          href={`/tv/${tvId}/season/${season}/episode/${episode + 1}`}
          className="inline-flex items-center gap-2 px-5 py-2 bg-red text-white rounded-full text-sm hover:bg-red-hover transition-colors"
        >
          Next Episode
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
