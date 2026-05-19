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
    <section className="relative h-screen w-full overflow-hidden">
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
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-3xl">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
          {movie.title}
        </h1>
        {movie.tagline && (
          <p className="text-lg text-muted italic mb-3">{movie.tagline}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-4">
          {year && <span>{year}</span>}
          {movie.runtime > 0 && <span>{formatRuntime(movie.runtime)}</span>}
          <span className="text-gold font-semibold">★ {rating}</span>
          {movie.genres?.slice(0, 3).map((g) => (
            <span key={g.id} className="px-3 py-0.5 bg-white/10 rounded-full text-xs">
              {g.name}
            </span>
          ))}
        </div>
        <p className="text-sm sm:text-base text-gray-300 line-clamp-3 mb-6 max-w-xl">
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
            href={`/movie/${movie.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors text-sm"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
