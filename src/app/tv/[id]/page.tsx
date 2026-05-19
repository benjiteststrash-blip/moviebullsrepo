import Image from "next/image";
import { fetchTVDetails } from "@/lib/tmdb";
import { getPosterUrl, getBackdropUrl, getYear, formatVoteAverage } from "@/lib/utils";
import { AdBanner } from "@/components/ads/AdBanner";
import { MovieCard } from "@/components/shared/MovieCard";
import { WatchlistButton } from "@/components/shared/WatchlistButton";
import { RecentlyViewedRecorder } from "@/components/shared/RecentlyViewedRecorder";
import { TVEpisodeList } from "./TVEpisodeList";

export const revalidate = 86400;

export default async function TVPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tv = await fetchTVDetails(Number(id));

  const backdrop = getBackdropUrl(tv.backdrop_path);
  const poster = getPosterUrl(tv.poster_path);
  const year = getYear(tv.first_air_date);
  const rating = formatVoteAverage(tv.vote_average);
  const cast = tv.credits?.cast?.slice(0, 6) || [];
  const seasons = tv.seasons?.filter((s) => s.season_number > 0) || [];
  const creators = tv.created_by?.slice(0, 3) || [];
  const networks = tv.networks?.slice(0, 3) || [];
  const country = tv.production_countries?.[0];
  const trailer = tv.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer") || tv.videos?.results?.find((video) => video.site === "YouTube");

  return (
    <div>
      <RecentlyViewedRecorder tmdbId={tv.id} type="tv" title={tv.name} posterPath={tv.poster_path} />
      <div className="relative h-[50vh] sm:h-[60vh] w-full">
        {backdrop && (
          <Image src={backdrop} alt={tv.name} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-full md:w-[300px]">
            {poster && (
              <Image
                src={poster}
                alt={tv.name}
                width={300}
                height={450}
                className="rounded-xl shadow-2xl w-full"
                priority
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-syne)] text-3xl sm:text-4xl font-extrabold text-white mb-2">
              {tv.name}
            </h1>
            {tv.tagline && <p className="text-muted italic mb-3">{tv.tagline}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-4">
              {year && <span>{year}</span>}
              <span>{tv.number_of_seasons} Seasons</span>
              <span>{tv.number_of_episodes} Episodes</span>
              <span className="text-gold font-semibold">★ {rating}</span>
              {tv.genres?.map((g) => (
                <span key={g.id} className="px-3 py-0.5 bg-white/10 rounded-full text-xs">
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-6">{tv.overview}</p>

            <div className="mb-6 grid gap-3 text-sm text-muted sm:grid-cols-2">
              {creators.length > 0 && <p><span className="font-semibold text-white">Created by:</span> {creators.map((person) => person.name).join(", ")}</p>}
              {networks.length > 0 && <p><span className="font-semibold text-white">Networks:</span> {networks.map((network) => network.name).join(", ")}</p>}
              {country && <p><span className="font-semibold text-white">Country:</span> {country.name}</p>}
              {tv.status && <p><span className="font-semibold text-white">Status:</span> {tv.status}</p>}
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <WatchlistButton tmdbId={tv.id} type="tv" title={tv.name} posterPath={tv.poster_path} />
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-border px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Watch Trailer
                </a>
              )}
            </div>

            {cast.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted mb-3">Cast</h3>
                <div className="flex flex-wrap gap-4">
                  {cast.map((c) => (
                    <div key={c.id} className="text-center w-16 sm:w-20">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface overflow-hidden mx-auto mb-1">
                        {c.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                            alt={c.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted text-xs">?</div>
                        )}
                      </div>
                      <p className="text-xs text-text truncate">{c.name}</p>
                      <p className="text-xs text-muted truncate">{c.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <AdBanner variant="leaderboard" />
        </div>

        {seasons.length > 0 && (
          <div className="mt-10">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white mb-4">Episodes</h2>
            <TVEpisodeList tvId={tv.id} seasons={seasons} />
          </div>
        )}

        <div className="mt-8">
          <AdBanner variant="rectangle" />
        </div>

        {tv.similar?.results?.length > 0 && (
          <div className="mt-12">
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-white mb-4">Similar Shows</h2>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {tv.similar.results.slice(0, 10).map((s) => (
                <MovieCard
                  key={s.id}
                  id={s.id}
                  title={s.name}
                  posterPath={s.poster_path}
                  firstAirDate={s.first_air_date}
                  voteAverage={s.vote_average}
                  type="tv"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
