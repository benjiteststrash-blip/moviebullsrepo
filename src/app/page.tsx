import Link from "next/link";
import { fetchTrending, fetchNowPlaying, fetchRecentMovies } from "@/lib/tmdb";
import { HeroSection } from "@/components/home/HeroSection";
import { MovieRow } from "@/components/home/MovieRow";
import { MediaBrowser } from "@/components/shared/MediaBrowser";
import { RecentlyWatched } from "@/components/home/RecentlyWatched";

export const revalidate = 3600;

const HOME_NETWORKS = [
  { id: 213, name: "Netflix" },
  { id: 2552, name: "Apple TV+" },
  { id: 4330, name: "Paramount+" },
  { id: 2739, name: "Disney+" },
  { id: 3186, name: "HBO Max" },
] as const;

export default async function HomePage() {
  const [trendingMovieRes, trendingTVRes, nowPlayingRes, recentRes] = await Promise.all([
    fetchTrending("movie", "week"),
    fetchTrending("tv", "week"),
    fetchNowPlaying(),
    fetchRecentMovies(),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const trendingMovies = trendingMovieRes.results;
  const newReleases = nowPlayingRes.results
    .filter((movie) => movie.release_date && movie.release_date <= today && movie.poster_path)
    .sort((a, b) => b.release_date.localeCompare(a.release_date));
  const heroMovie = trendingMovies.find((movie) => movie.backdrop_path && movie.release_date && movie.release_date <= today);
  const hasContent = trendingMovies.length || trendingTVRes.results.length || newReleases.length || recentRes.results.length;

  return (
    <div>
      <div className="h-20" aria-hidden="true" />
      <RecentlyWatched />
      {heroMovie && <HeroSection movie={heroMovie} />}
      {!hasContent && (
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
          <h1 className="text-3xl font-bold text-white">The catalogue is taking a moment.</h1>
          <p className="mt-4 text-sm text-muted">Please refresh in a moment, or try searching for a title.</p>
          <Link href="/search" className="mt-6 rounded-full bg-red px-6 py-3 font-semibold text-white">Search titles</Link>
        </section>
      )}
      <div className={`relative z-10 mx-auto max-w-7xl ${heroMovie ? "-mt-10 sm:-mt-12" : "pt-24"}`}>
        <MovieRow title="New releases" items={newReleases} type="movie" viewMoreHref="/movies?sort=now_playing" eager />
        <MovieRow title="Trending movies this week" items={trendingMovies} type="movie" viewMoreHref="/movies?sort=trending" />
        <MovieRow title="Trending TV shows" items={trendingTVRes.results} type="tv" viewMoreHref="/tv?sort=trending" />
        <section className="mb-8 border-y border-border px-4 py-6 sm:px-6" aria-label="Browse by network">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-muted">Browse by network</h2>
            <Link href="/networks" className="flex min-h-11 items-center text-sm font-semibold text-white hover:text-red">View all</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {HOME_NETWORKS.map((network) => (
              <Link key={network.id} href={`/network/${network.id}`} className="flex min-h-11 shrink-0 items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-red">
                {network.name}
              </Link>
            ))}
          </div>
        </section>
        <MediaBrowser type="movie" title="For you" subtitle="New releases and popular picks, with more to explore as you scroll." initialMode="recent" initialData={recentRes.total_pages ? recentRes : undefined} embedded />
      </div>
    </div>
  );
}
