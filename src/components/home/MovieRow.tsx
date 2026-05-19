import Link from "next/link";
import { MovieCard } from "@/components/shared/MovieCard";
import type { MediaType, TMDBMovie, TMDBTVShow } from "@/types/tmdb";

interface MovieRowProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[];
  type: MediaType;
  viewMoreHref?: string;
}

export function MovieRow({ title, items, type, viewMoreHref }: MovieRowProps) {
  if (!items?.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3 px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>
        {viewMoreHref && (
          <Link
            href={viewMoreHref}
            className="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-red hover:bg-white/5 sm:text-sm"
          >
            View more
          </Link>
        )}
      </div>
      <div className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-4 sm:px-6 scrollbar-none">
        {items.map((item) => {
          const id = item.id;
          const title = "title" in item ? item.title : item.name;
          const posterPath = item.poster_path;
          const releaseDate = "release_date" in item ? item.release_date : undefined;
          const firstAirDate = "first_air_date" in item ? item.first_air_date : undefined;
          const voteAverage = item.vote_average;

          return (
            <div key={id} className="snap-start">
              <MovieCard
                id={id}
                title={title}
                posterPath={posterPath}
                releaseDate={releaseDate}
                firstAirDate={firstAirDate}
                voteAverage={voteAverage}
                type={type}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
