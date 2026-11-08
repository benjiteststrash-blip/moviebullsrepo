"use client";

import Image from "next/image";
import Link from "next/link";
import { getBackdropUrl, getYear, formatRuntime, formatVoteAverage } from "@/lib/utils";
import type { TMDBMovie } from "@/types/tmdb";

interface HeroSectionProps {
  movie: TMDBMovie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const year = getYear(movie.release_date);
  const rating = formatVoteAverage(movie.vote_average);

  return (
    <section className="relative min-h-[340px] w-full overflow-hidden sm:min-h-[400px]">
      {backdrop && (
        <Image
          src={backdrop}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-red">Trending this week</p>
        <h1 className="mb-4 font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
          <span className="line-clamp-2 max-w-3xl text-balance">{movie.title}</span>
        </h1>
        {movie.tagline && (
          <p className="text-lg text-muted italic mb-3">{movie.tagline}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-4">
          {year && <span>{year}</span>}
          {movie.runtime > 0 && <span>{formatRuntime(movie.runtime)}</span>}
          {rating !== "N/A" && <span className="text-gold font-semibold">★ {rating}</span>}
          {movie.genres?.slice(0, 3).map((g) => (
            <span key={g.id} className="px-3 py-0.5 bg-white/10 rounded-full text-xs">
              {g.name}
            </span>
          ))}
        </div>
        <p className="mb-6 line-clamp-2 max-w-xl text-sm text-gray-300 sm:text-base md:line-clamp-3">
          {movie.overview}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={`/movie/${movie.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red hover:bg-red-hover text-white font-semibold rounded-full transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </Link>
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors text-sm"
          >
            Explore new movies
          </Link>
        </div>
      </div>
    </section>
  );
}
