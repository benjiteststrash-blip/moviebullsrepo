"use client";

import { useWatchlist } from "@/hooks/useWatchlist";

interface WatchlistButtonProps {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function WatchlistButton({ tmdbId, type, title, posterPath }: WatchlistButtonProps) {
  const { isInWatchlist, toggle } = useWatchlist();
  const active = isInWatchlist(tmdbId, type);

  return (
    <button
      type="button"
      onClick={() => toggle({ tmdb_id: tmdbId, type, title, poster_path: posterPath })}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-white/10 text-white hover:bg-white/15"
          : "bg-red text-white hover:bg-red-hover"
      }`}
    >
      <svg
        className={`h-5 w-5 ${active ? "fill-red text-red" : "text-white"}`}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z"
        />
      </svg>
      {active ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
