import Link from "next/link";
import { MOVIE_GENRES, TV_GENRES } from "@/lib/catalog";

export default function GenresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Discovery</p>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">Genres</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">Movies</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MOVIE_GENRES.map((genre) => (
              <Link key={genre.id} href={`/genre/${genre.slug}?type=movie`} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-red">
                {genre.name}
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">TV Shows</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TV_GENRES.map((genre) => (
              <Link key={genre.id} href={`/genre/${genre.slug}?type=tv`} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-red">
                {genre.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
