"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSearch } from "@/lib/tmdb";
import { getPosterUrl, getYear, formatVoteAverage } from "@/lib/utils";
import { rankSearchResults } from "@/lib/searchRank";
import type { TMDBMultiSearchResult } from "@/types/tmdb";

function isMediaResult(result: TMDBMultiSearchResult): result is TMDBMultiSearchResult & {
  media_type: "movie" | "tv";
} {
  return result.media_type === "movie" || result.media_type === "tv";
}

function getTitle(result: TMDBMultiSearchResult) {
  return result.media_type === "movie" ? result.title || "Untitled movie" : result.name || "Untitled show";
}

function getHref(result: TMDBMultiSearchResult) {
  return result.media_type === "movie" ? `/movie/${result.id}` : `/tv/${result.id}`;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<TMDBMultiSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(async () => {
      const nextQuery = query.trim();

      if (nextQuery.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [pageOne, pageTwo] = await Promise.all([
          fetchSearch(nextQuery, 1),
          fetchSearch(nextQuery, 2),
        ]);
        const ranked = rankSearchResults(nextQuery, [...pageOne.results, ...pageTwo.results].filter(isMediaResult));
        setResults(ranked.slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  const goToSearch = useCallback(() => {
    const nextQuery = query.trim();
    if (!nextQuery) return;
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
    close();
  }, [close, query, router]);

  const goToResult = useCallback((result: TMDBMultiSearchResult) => {
    router.push(getHref(result));
    close();
  }, [close, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 text-white transition-colors hover:text-red"
        aria-label="Search"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 px-4 pt-20 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl">
            <div className="relative">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") goToSearch();
                  if (event.key === "Escape") close();
                }}
                placeholder="Search movies, shows, actors..."
                className="h-14 w-full rounded-lg border border-border bg-surface px-5 pr-14 text-base text-text outline-none transition-colors focus:border-red"
              />
              <button
                type="button"
                onClick={goToSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition-colors hover:text-red"
                aria-label="Search all results"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                </svg>
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
              {query.trim().length < 2 ? (
                <div className="p-5 text-sm text-muted">Start typing to find something to watch.</div>
              ) : loading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="h-16 w-11 animate-pulse rounded bg-white/10" />
                      <div className="flex flex-1 flex-col gap-2 py-1">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="max-h-[65vh] overflow-y-auto p-2">
                  {results.filter(isMediaResult).map((result) => {
                    const poster = getPosterUrl(result.poster_path, "w300");
                    const title = getTitle(result);
                    const year = getYear(result.release_date || result.first_air_date || "");

                    return (
                      <button
                        key={`${result.media_type}-${result.id}`}
                        type="button"
                        onClick={() => goToResult(result)}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5"
                      >
                        <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded bg-black">
                          {poster ? (
                            <Image src={poster} alt={title} fill sizes="44px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">No art</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{title}</p>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted">
                              {result.media_type === "movie" ? "Movie" : "TV"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {year || "Unknown year"}
                            {result.vote_average ? ` • ${formatVoteAverage(result.vote_average)}` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={goToSearch}
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                  >
                    View all results for &ldquo;{query.trim()}&rdquo;
                  </button>
                </div>
              ) : (
                <div className="p-5 text-sm text-muted">No quick matches. Press Enter to search deeper.</div>
              )}
            </div>

            <button
              type="button"
              onClick={close}
              className="mx-auto mt-4 block text-sm text-muted transition-colors hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
