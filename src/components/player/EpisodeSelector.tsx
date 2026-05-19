"use client";

import type { TMDBSeason } from "@/types/tmdb";

interface EpisodeSelectorProps {
  seasons: TMDBSeason[];
  currentSeason: number;
  onSeasonChange: (season: number) => void;
}

export function EpisodeSelector({ seasons, currentSeason, onSeasonChange }: EpisodeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {seasons.map((s) => (
        <button
          key={s.season_number}
          onClick={() => onSeasonChange(s.season_number)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            s.season_number === currentSeason
              ? "bg-red text-white"
              : "bg-surface text-muted hover:text-white border border-border"
          }`}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
