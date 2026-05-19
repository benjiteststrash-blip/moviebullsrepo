import Image from "next/image";
import { MovieCard } from "@/components/shared/MovieCard";
import { collectionNameFromSlug } from "@/lib/catalog";
import { fetchCollectionDetails, fetchCollectionSearch } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/utils";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = collectionNameFromSlug(slug);
  const search = await fetchCollectionSearch(query);
  const match = search.results[0];
  const collection = match ? await fetchCollectionDetails(match.id) : null;
  const backdrop = getBackdropUrl(collection?.backdrop_path || match?.backdrop_path || null);

  return (
    <div className="pb-12">
      <section className="relative min-h-[320px] overflow-hidden pt-24">
        {backdrop && <Image src={backdrop} alt={collection?.name || query} fill priority sizes="100vw" className="object-cover opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Collection</p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-white sm:text-5xl">
            {collection?.name || query}
          </h1>
          {collection?.overview && <p className="mt-4 max-w-3xl text-sm text-gray-300 sm:text-base">{collection.overview}</p>}
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        {collection?.parts?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {collection.parts.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
                voteAverage={movie.vote_average}
                type="movie"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface py-12 text-center">
            <p className="text-muted">No collection titles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
