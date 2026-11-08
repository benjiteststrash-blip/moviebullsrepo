import { MediaBrowser } from "@/components/shared/MediaBrowser";

export default async function TVShowsPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  const mode = sort === "trending" ? "trending" : "popular";
  return <MediaBrowser key={mode} type="tv" title="TV Shows" initialMode={mode} />;
}
