import Link from "next/link";
import { COUNTRIES } from "@/lib/catalog";

export default function CountriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Discovery</p>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">Countries</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {COUNTRIES.map((country) => (
          <Link key={country.code} href={`/country/${country.code}`} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-red">
            {country.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
