"use client";

import Image from "next/image";
import Link from "next/link";
import { getPosterUrl, getYear, formatVoteAverage } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { MediaType } from "@/types/tmdb";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage: number;
  type: MediaType;
}

export function MovieCard({ id, title, posterPath, releaseDate, firstAirDate, voteAverage, type }: MovieCardProps) {
  const { isInWatchlist, toggle } = useWatchlist();
  const inWatchlist = isInWatchlist(id, type);
  const poster = getPosterUrl(posterPath);
  const year = getYear(releaseDate || firstAirDate || "");
  const rating = formatVoteAverage(voteAverage);
  const href = type === "movie" ? `/movie/${id}` : `/tv/${id}`;

  return (
    <Link
      href={href}
      className="group relative flex h-full w-[160px] flex-shrink-0 flex-col sm:w-[180px]"
      aria-label={`Open ${title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-surface">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(min-width: 640px) 180px, 160px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm p-2 text-center">
            No Poster
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {rating !== "N/A" && (
              <span className="text-gold text-sm font-semibold">★ {rating}</span>
            )}
            <span className="text-xs bg-red px-2 py-0.5 rounded font-semibold">HD</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex h-[3.75rem] flex-col overflow-hidden">
        <h3 className="min-h-10 overflow-hidden text-sm font-semibold leading-5 text-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {title}
        </h3>
        <p className={`mt-1 h-4 text-xs text-muted ${year ? "" : "opacity-0"}`} aria-hidden={!year}>
          {year || "0000"}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle({ tmdb_id: id, type, title, poster_path: posterPath });
        }}
        className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1.5 opacity-0 transition-opacity duration-300 hover:bg-red group-hover:opacity-100 group-focus-within:opacity-100"
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        <svg
          className={`w-4 h-4 ${inWatchlist ? "text-red fill-red" : "text-white"}`}
          fill={inWatchlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </Link>
  );
}
