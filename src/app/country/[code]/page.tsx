import { MediaBrowser } from "@/components/shared/MediaBrowser";
import { COUNTRIES } from "@/lib/catalog";

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const country = COUNTRIES.find((item) => item.code === upperCode);

  return (
    <MediaBrowser
      type="movie"
      title={`${country?.name || upperCode} Movies`}
      subtitle="Browse movies by country of origin."
      fixedParams={{ with_origin_country: upperCode }}
    />
  );
}
