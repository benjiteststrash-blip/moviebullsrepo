"use client";

import { MovieCard } from "@/components/shared/MovieCard";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export function MyListClient() {
  const { items: watchlist } = useWatchlist();
  const { items: recent } = useRecentlyViewed();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Personal</p>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">My List</h1>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-white">Watchlist</h2>
        {watchlist.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {watchlist.map((item) => (
              <MovieCard
                key={`${item.type}-${item.tmdb_id}`}
                id={item.tmdb_id}
                title={item.title}
                posterPath={item.poster_path}
                voteAverage={0}
                type={item.type}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
            Add titles with the heart button and they will appear here.
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-white">Recently Viewed</h2>
        {recent.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {recent.map((item) => (
              <MovieCard
                key={`${item.type}-${item.tmdb_id}-${item.viewed_at}`}
                id={item.tmdb_id}
                title={item.title}
                posterPath={item.poster_path}
                voteAverage={0}
                type={item.type}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
            Titles you open will show up here.
          </div>
        )}
      </section>
    </div>
  );
}
