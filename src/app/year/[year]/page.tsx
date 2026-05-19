import { MediaBrowser } from "@/components/shared/MediaBrowser";

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return (
    <MediaBrowser
      type="movie"
      title={`${year} Movies`}
      subtitle="Movies from this release year, sorted by popularity unless you change the filters."
      initialYear={year}
    />
  );
}
