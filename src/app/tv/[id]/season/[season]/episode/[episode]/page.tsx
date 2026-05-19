import Link from "next/link";
import Image from "next/image";
import { fetchSeasonDetails, fetchTVDetails } from "@/lib/tmdb";
import { PlayerModal } from "@/components/player/PlayerModal";
import { AdBanner } from "@/components/ads/AdBanner";
import { getStillUrl, formatDate } from "@/lib/utils";
import { EpisodeNavigation } from "./EpisodeNavigation";

export const revalidate = 86400;

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ id: string; season: string; episode: string }>;
}) {
  const { id, season, episode } = await params;
  const tvId = Number(id);
  const seasonNum = Number(season);
  const episodeNum = Number(episode);
  const [tv, seasonDetails] = await Promise.all([
    fetchTVDetails(tvId),
    fetchSeasonDetails(tvId, seasonNum),
  ]);
  const episodes = seasonDetails.episodes || [];
  const currentEpisode = episodes.find((item) => item.episode_number === episodeNum);
  const totalEpisodes = tv.seasons?.find((s) => s.season_number === seasonNum)?.episode_count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
      <div className="mb-6">
        <Link href={`/tv/${tvId}`} className="text-sm text-muted hover:text-white transition-colors">
          Back to {tv.name}
        </Link>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-white mt-2">
          {tv.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Season {seasonNum} Episode {episodeNum}
          {currentEpisode?.name ? `: ${currentEpisode.name}` : ""}
        </p>
        {currentEpisode?.overview && (
          <p className="mt-3 max-w-3xl text-sm text-gray-300">{currentEpisode.overview}</p>
        )}
      </div>

      <AdBanner variant="leaderboard" />

      <div className="mt-6">
        <PlayerModal tmdbId={tvId} type="tv" season={seasonNum} episode={episodeNum} />
      </div>

      <AdBanner variant="rectangle" />

      <EpisodeNavigation
        tvId={tvId}
        season={seasonNum}
        episode={episodeNum}
        totalEpisodes={totalEpisodes}
      />

      {episodes.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-syne)] text-xl font-bold text-white">
            Season {seasonNum} Episodes
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((item) => {
              const still = getStillUrl(item.still_path);
              const active = item.episode_number === episodeNum;

              return (
                <Link
                  key={item.id}
                  href={`/tv/${tvId}/season/${seasonNum}/episode/${item.episode_number}`}
                  className={`group overflow-hidden rounded-lg border bg-surface transition-colors ${
                    active ? "border-red" : "border-border hover:bg-white/5"
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative h-[68px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-black">
                      {still ? (
                        <Image src={still} alt={item.name} fill sizes="120px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                          No still
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">E{item.episode_number}</p>
                      <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-red">
                        {item.name}
                      </h3>
                      {item.air_date && <p className="mt-1 text-xs text-muted">{formatDate(item.air_date)}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
