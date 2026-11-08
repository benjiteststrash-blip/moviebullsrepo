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
  eager?: boolean;
  href?: string;
  subtitle?: string;
}

export function MovieCard({ id, title, posterPath, releaseDate, firstAirDate, voteAverage, type, eager = false, href, subtitle }: MovieCardProps) {
  const { isInWatchlist, toggle } = useWatchlist();
  const inWatchlist = isInWatchlist(id, type);
  const poster = getPosterUrl(posterPath);
  const year = getYear(releaseDate || firstAirDate || "");
  const rating = formatVoteAverage(voteAverage);
  const linkHref = href || (type === "movie" ? `/movie/${id}` : `/tv/${id}`);

  return (
    <div className="group relative flex h-full w-full min-w-0 flex-col">
      <Link href={linkHref} prefetch={false} className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-red" aria-label={`Open ${title}`}>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-surface">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(min-width: 1280px) 230px, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
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
          </div>
        </div>
      </div>
      <div className="mt-2 flex h-[3.75rem] flex-col overflow-hidden">
        <h3 className="min-h-10 overflow-hidden text-sm font-semibold leading-5 text-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {title}
        </h3>
        <p className={`mt-1 h-4 truncate text-xs text-muted ${subtitle || year ? "" : "opacity-0"}`} aria-hidden={!subtitle && !year}>
          {subtitle || year || "0000"}
        </p>
      </div>
      </Link>
      <button
        type="button"
        onClick={() => {
          toggle({ tmdb_id: id, type, title, poster_path: posterPath });
        }}
        className="absolute top-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 opacity-100 transition-opacity duration-300 hover:bg-white/20 sm:opacity-0 sm:[@media(hover:none)]:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-pressed={inWatchlist}
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
    </div>
  );
}
