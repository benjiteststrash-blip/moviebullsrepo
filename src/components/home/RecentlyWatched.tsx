"use client";

import { MovieCard } from "@/components/shared/MovieCard";
import { useRecentlyWatched } from "@/hooks/useRecentlyWatched";

export function RecentlyWatched() {
  const items = useRecentlyWatched();
  if (!items.length) return null;

  return (
    <section className="mx-auto mb-5 max-w-7xl" aria-label="Recently watched">
      <div className="mb-4 flex items-center justify-between gap-3 px-4 sm:px-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Recently watched</h2>
        <p className="text-xs text-muted">On this device</p>
      </div>
      <div className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6">
        {items.map((item) => (
          <div key={`${item.type}-${item.tmdb_id}`} className="w-[144px] shrink-0 snap-start sm:w-[180px]">
            <MovieCard id={item.tmdb_id} type={item.type} title={item.title} posterPath={item.poster_path} voteAverage={0}
              href={item.type === "tv" ? `/tv/${item.tmdb_id}/season/${item.season}/episode/${item.episode}` : `/movie/${item.tmdb_id}`}
              subtitle={item.type === "tv" ? `Season ${item.season} · Episode ${item.episode}` : "Movie"} />
          </div>
        ))}
      </div>
    </section>
  );
}
