import { MediaBrowser } from "@/components/shared/MediaBrowser";
import { fetchRecentMovies } from "@/lib/tmdb";

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  const mode = sort === "trending" ? "trending" : sort === "now_playing" ? "now_playing" : sort === "newest" ? "newest" : "recent";
  const initialData = mode === "recent" ? await fetchRecentMovies() : undefined;
  return <MediaBrowser key={mode} type="movie" title="Movies" subtitle="New releases first. Switch to weekly trends, or narrow things down by genre and year." initialMode={mode} initialData={initialData?.total_pages ? initialData : undefined} />;
}
