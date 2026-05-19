import { MediaBrowser } from "@/components/shared/MediaBrowser";
import { NETWORKS } from "@/lib/catalog";

export default async function NetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const network = NETWORKS.find((item) => String(item.id) === id);

  return (
    <MediaBrowser
      type="tv"
      title={`${network?.name || "Network"} Shows`}
      subtitle="TV catalog filtered by network."
      fixedParams={{ with_networks: id }}
    />
  );
}
