"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchSearch } from "@/lib/tmdb";
import { MovieCard } from "@/components/shared/MovieCard";
import { rankSearchResults } from "@/lib/searchRank";
import { ScrollLoader } from "@/components/shared/ScrollLoader";
import { useInfiniteMedia } from "@/hooks/useInfiniteMedia";
import type { TMDBMultiSearchResult } from "@/types/tmdb";

function isMediaResult(result: TMDBMultiSearchResult): result is TMDBMultiSearchResult & {
  media_type: "movie" | "tv";
} {
  return result.media_type === "movie" || result.media_type === "tv";
}

function resultKey(item: TMDBMultiSearchResult) { return `${item.media_type}-${item.id}`; }

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [searchQuery, setSearchQuery] = useState(urlQuery.trim());

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const loadPage = useCallback(async (page: number) => {
    if (!searchQuery) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    const data = await fetchSearch(searchQuery, page);
    return { ...data, results: rankSearchResults(searchQuery, data.results.filter(isMediaResult)) };
  }, [searchQuery]);
  const { items: results, loading, error, hasMore, loadMore } = useInfiniteMedia(loadPage, resultKey);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(urlQuery), 0);
    return () => window.clearTimeout(timer);
  }, [urlQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextUrl = trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search";
      router.replace(nextUrl, { scroll: false });
      setSearchQuery(trimmedQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [router, trimmedQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <h1 className="mb-6 font-[family-name:var(--font-syne)] text-3xl font-bold text-white">Search</h1>

      <div className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="search"
            aria-label="Search movies and TV shows"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies & TV shows..."
            className="w-full rounded-lg border border-border bg-surface px-5 py-3 text-base text-text transition-colors focus:border-red focus:outline-none"
          />
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
          </svg>
        </div>
      </div>

      {loading && results.length === 0 && searchQuery ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : searchQuery && !loading && !error && results.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted">No results for &ldquo;{searchQuery}&rdquo;</p>
          <p className="mt-2 text-sm text-muted">Try a different search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-busy={loading}>
            {results.filter(isMediaResult).map((item) => {
              const title = item.media_type === "movie" ? item.title || "Untitled movie" : item.name || "Untitled show";
              const releaseDate = item.media_type === "movie" ? item.release_date : undefined;
              const firstAirDate = item.media_type === "tv" ? item.first_air_date : undefined;

              return (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  id={item.id}
                  title={title}
                  posterPath={item.poster_path}
                  releaseDate={releaseDate}
                  firstAirDate={firstAirDate}
                  voteAverage={item.vote_average}
                  type={item.media_type}
                />
              );
            })}
          </div>
        </>
      )}
      {searchQuery && <ScrollLoader hasMore={hasMore} loading={loading || trimmedQuery !== searchQuery} error={error} onLoadMore={loadMore} />}
    </div>
  );
}
