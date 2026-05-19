import Link from "next/link";
import { fetchTrending, fetchPopular, fetchTopRated, fetchNowPlaying, fetchUpcoming, fetchDiscover } from "@/lib/tmdb";
import { HeroSection } from "@/components/home/HeroSection";
import { MovieRow } from "@/components/home/MovieRow";

export const revalidate = 3600;

const HOME_NETWORKS = [
  { id: 213, name: "Netflix" },
  { id: 2552, name: "Apple TV+" },
  { id: 4330, name: "Paramount+" },
  { id: 2739, name: "Disney+" },
  { id: 3186, name: "HBO Max" },
] as const;

export default async function HomePage() {
  const [
    trendingMovieRes,
    trendingTVRes,
    popularRes,
    topRatedRes,
    nowPlayingRes,
    upcomingRes,
    ...networkResponses
  ] =
    await Promise.all([
      fetchTrending("movie", "week"),
      fetchTrending("tv", "week"),
      fetchPopular("movie"),
      fetchTopRated("movie"),
      fetchNowPlaying(),
      fetchUpcoming(),
      ...HOME_NETWORKS.map((network) => fetchDiscover("tv", { with_networks: network.id })),
    ]);

  const trendingMovies = trendingMovieRes.results;
  const trendingTV = trendingTVRes.results;
  const popular = popularRes.results;
  const topRated = topRatedRes.results;
  const nowPlaying = nowPlayingRes.results;
  const upcoming = upcomingRes.results;

  const heroMovie = trendingMovies[0];
  const hasContent = [
    trendingMovies,
    trendingTV,
    popular,
    topRated,
    nowPlaying,
    upcoming,
  ].some((items) => items.length > 0);

  return (
    <div>
      {heroMovie && <HeroSection movie={heroMovie} />}
      {!hasContent && (
        <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-red">Local setup needed</p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-white sm:text-5xl">
            Add your TMDB token to start streaming the catalog.
          </h1>
          <p className="mt-4 text-sm text-muted sm:text-base">
            Create a <code className="rounded bg-white/10 px-1.5 py-0.5">.env.local</code> file with
            <code className="ml-1 rounded bg-white/10 px-1.5 py-0.5">TMDB_API_KEY</code>, then restart the dev server.
          </p>
        </section>
      )}
      <div className="relative z-10 -mt-32">
        <MovieRow title="Trending Movies" items={trendingMovies} type="movie" />
        <MovieRow title="Trending TV Shows" items={trendingTV} type="tv" />
        <section className="mb-8 px-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-white sm:text-2xl">
              Streaming Categories
            </h2>
            <Link href="/networks" className="text-sm font-semibold text-muted transition-colors hover:text-white">
              View all
            </Link>
          </div>
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {HOME_NETWORKS.map((network) => (
              <Link
                key={network.id}
                href={`/network/${network.id}`}
                className="snap-start rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-red hover:bg-white/5"
              >
                {network.name}
              </Link>
            ))}
          </div>
        </section>
        {HOME_NETWORKS.map((network, index) => (
          <MovieRow
            key={network.id}
            title={`${network.name} Shows`}
            items={networkResponses[index]?.results || []}
            type="tv"
            viewMoreHref={`/network/${network.id}`}
          />
        ))}
        <MovieRow title="Popular Movies" items={popular} type="movie" />
        <MovieRow title="Top Rated All Time" items={topRated} type="movie" />
        <MovieRow title="Now Playing in Cinemas" items={nowPlaying} type="movie" />
        <MovieRow title="Coming Soon" items={upcoming} type="movie" />
      </div>
    </div>
  );
}
