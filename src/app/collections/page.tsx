import Link from "next/link";
import { COLLECTIONS, slugify } from "@/lib/catalog";

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Discovery</p>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">Collections</h1>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((name) => (
          <Link key={name} href={`/collections/${slugify(name)}`} className="rounded-lg border border-border bg-surface px-4 py-4 text-sm font-semibold text-white transition-colors hover:border-red">
            {name}
          </Link>
        ))}
      </div>
    </div>
  );
}
