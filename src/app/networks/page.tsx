import Link from "next/link";
import { NETWORKS } from "@/lib/catalog";

export default function NetworksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Discovery</p>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">Networks</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {NETWORKS.map((network) => (
          <Link key={network.id} href={`/network/${network.id}`} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-red">
            {network.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
