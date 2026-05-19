"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStillUrl, formatDate } from "@/lib/utils";
import type { TMDBEpisode, TMDBSeason } from "@/types/tmdb";
import { fetchSeasonDetails } from "@/lib/tmdb";

interface TVEpisodeListProps {
  tvId: number;
  seasons: TMDBSeason[];
}

export function TVEpisodeList({ tvId, seasons }: TVEpisodeListProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.season_number || 1);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEpisodes = useCallback(async (seasonNum: number) => {
    setLoading(true);
    try {
      const data = await fetchSeasonDetails(tvId, seasonNum);
      setEpisodes(data.episodes || []);
    } catch {
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  }, [tvId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEpisodes(selectedSeason);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadEpisodes, selectedSeason]);

  const season = seasons.find((s) => s.season_number === selectedSeason);
  if (!season) return null;

  return (
    <div>
      <div className="mb-6 max-w-xs">
        <label htmlFor="season-select" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Season
        </label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(event) => setSelectedSeason(Number(event.target.value))}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white outline-none transition-colors focus:border-red"
        >
          {seasons.map((s) => (
            <option key={s.season_number} value={s.season_number}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl overflow-hidden animate-pulse h-32" />
          ))}
        </div>
      ) : episodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/tv/${tvId}/season/${selectedSeason}/episode/${ep.episode_number}`}
              className="group overflow-hidden rounded-lg bg-surface transition-colors hover:bg-white/5"
            >
              <div className="flex gap-3 p-3">
                <div className="relative h-[68px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-black">
                  {ep.still_path ? (
                    <Image
                      src={getStillUrl(ep.still_path) || ""}
                      alt={ep.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted">E{ep.episode_number}</p>
                  <h4 className="text-sm font-semibold text-text truncate group-hover:text-red transition-colors">
                    {ep.name}
                  </h4>
                  {ep.air_date && (
                    <p className="text-xs text-muted mt-1">{formatDate(ep.air_date)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted">{season.episode_count} episodes</p>
          <p className="text-sm text-muted mt-2">Select a season to load episodes</p>
        </div>
      )}
    </div>
  );
}
