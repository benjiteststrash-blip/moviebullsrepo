import { Suspense } from "react";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
          <div className="mb-6 h-10 w-40 animate-pulse rounded-lg bg-surface" />
          <div className="mb-8 h-12 max-w-xl animate-pulse rounded-lg bg-surface" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
