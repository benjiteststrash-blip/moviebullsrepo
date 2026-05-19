import Link from "next/link";
import { YEARS } from "@/lib/catalog";

export default function YearsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Discovery</p>
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">Browse By Year</h1>
      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {YEARS.map((year) => (
          <Link key={year} href={`/year/${year}`} className="rounded-lg border border-border bg-surface px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-red">
            {year}
          </Link>
        ))}
      </div>
    </div>
  );
}
