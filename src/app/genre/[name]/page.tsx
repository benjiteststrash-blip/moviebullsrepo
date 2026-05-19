import { MediaBrowser } from "@/components/shared/MediaBrowser";
import { getGenreBySlug } from "@/lib/catalog";
import type { MediaType } from "@/types/tmdb";

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { name } = await params;
  const { type: rawType } = await searchParams;
  const type: MediaType = rawType === "tv" ? "tv" : "movie";
  const genre = getGenreBySlug(name, type) || getGenreBySlug(name, "movie") || getGenreBySlug(name, "tv");

  if (!genre) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
        <h1 className="text-2xl font-bold text-white">Genre not found</h1>
      </div>
    );
  }

  return (
    <MediaBrowser
      type={type}
      title={`${genre.name} ${type === "movie" ? "Movies" : "TV Shows"}`}
      subtitle="A deep filtered catalog with load-more browsing."
      initialGenreId={genre.id}
    />
  );
}
