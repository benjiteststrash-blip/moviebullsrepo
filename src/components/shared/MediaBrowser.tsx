"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAiringToday,
  fetchDiscover,
  fetchNowPlaying,
  fetchOnTheAir,
  fetchPopular,
  fetchTopRated,
  fetchTrending,
  fetchUpcoming,
} from "@/lib/tmdb";
import { MOVIE_GENRES, TV_GENRES, YEARS } from "@/lib/catalog";
import { MovieCard } from "@/components/shared/MovieCard";
import type { MediaType, TMDBMovie, TMDBTVShow } from "@/types/tmdb";

type BrowserMode = "popular" | "trending" | "top_rated" | "newest" | "now_playing" | "upcoming" | "on_air" | "airing_today";
type MediaItem = TMDBMovie | TMDBTVShow;

interface MediaBrowserProps {
  type: MediaType;
  title: string;
  subtitle?: string;
  initialGenreId?: number;
  initialYear?: string;
  fixedParams?: Record<string, string | number>;
}

const MOVIE_MODES: { label: string; value: BrowserMode }[] = [
  { label: "Popular", value: "popular" },
  { label: "Trending", value: "trending" },
  { label: "Top Rated", value: "top_rated" },
  { label: "Newest", value: "newest" },
  { label: "Now Playing", value: "now_playing" },
  { label: "Upcoming", value: "upcoming" },
];

const TV_MODES: { label: string; value: BrowserMode }[] = [
  { label: "Popular", value: "popular" },
  { label: "Trending", value: "trending" },
  { label: "Top Rated", value: "top_rated" },
  { label: "Newest", value: "newest" },
  { label: "On Air", value: "on_air" },
  { label: "Today", value: "airing_today" },
];

function getTitle(item: MediaItem) {
  return "title" in item ? item.title : item.name;
}

function getReleaseDate(item: MediaItem) {
  return "release_date" in item ? item.release_date : undefined;
}

function getFirstAirDate(item: MediaItem) {
  return "first_air_date" in item ? item.first_air_date : undefined;
}

function dedupeItems(items: MediaItem[]) {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MediaBrowser({ type, title, subtitle, initialGenreId, initialYear, fixedParams }: MediaBrowserProps) {
  const modes = type === "movie" ? MOVIE_MODES : TV_MODES;
  const genres = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const [mode, setMode] = useState<BrowserMode>("popular");
  const [genreId, setGenreId] = useState(initialGenreId ? String(initialGenreId) : "");
  const [year, setYear] = useState(initialYear || "");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const hasFilters = Boolean(genreId || year || fixedParams);

  const discoverParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      sort_by: mode === "top_rated" ? "vote_average.desc" : mode === "newest" ? (type === "movie" ? "primary_release_date.desc" : "first_air_date.desc") : "popularity.desc",
      with_genres: genreId || undefined,
      "vote_count.gte": mode === "top_rated" ? 100 : undefined,
      ...fixedParams,
    };

    if (year) {
      params[type === "movie" ? "primary_release_year" : "first_air_date_year"] = year;
    }

    if (mode === "newest") {
      params[type === "movie" ? "primary_release_date.lte" : "first_air_date.lte"] = today();
    }

    return params;
  }, [fixedParams, genreId, mode, type, year]);

  const loadPage = useCallback(async (nextPage: number) => {
    if (hasFilters || mode === "newest") {
      return fetchDiscover(type, { ...discoverParams, page: nextPage });
    }

    if (mode === "popular") return type === "movie" ? fetchPopular("movie", nextPage) : fetchPopular("tv", nextPage);
    if (mode === "top_rated") return type === "movie" ? fetchTopRated("movie", nextPage) : fetchTopRated("tv", nextPage);
    if (mode === "trending") return type === "movie" ? fetchTrending("movie", "week", nextPage) : fetchTrending("tv", "week", nextPage);
    if (mode === "now_playing") return fetchNowPlaying(nextPage);
    if (mode === "upcoming") return fetchUpcoming(nextPage);
    if (mode === "on_air") return fetchOnTheAir(nextPage);
    if (mode === "airing_today") return fetchAiringToday(nextPage);

    return fetchDiscover(type, { ...discoverParams, page: nextPage });
  }, [discoverParams, hasFilters, mode, type]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const data = await loadPage(1);
        if (cancelled) return;
        setItems(data.results);
        setPage(1);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch {
        if (cancelled) return;
        setItems([]);
        setPage(1);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loadPage]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const data = await loadPage(nextPage);
      setItems((current) => dedupeItems([...current, ...data.results]));
      setPage(nextPage);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Browse</p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setMode(item.value);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === item.value ? "bg-red text-white" : "border border-border bg-surface text-muted hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Genre</span>
          <select
            value={genreId}
            onChange={(event) => setGenreId(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-red"
          >
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Year</span>
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-red"
          >
            <option value="">All years</option>
            {YEARS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setGenreId(initialGenreId ? String(initialGenreId) : "");
              setYear(initialYear || "");
              setMode("popular");
            }}
            className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-white"
          >
            Reset Filters
          </button>
        </div>
        <div className="flex items-end text-xs text-muted">
          Page {page} of {totalPages}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-12 text-center">
          <p className="text-muted">No titles found. Try a broader filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <MovieCard
                key={item.id}
                id={item.id}
                title={getTitle(item)}
                posterPath={item.poster_path}
                releaseDate={getReleaseDate(item)}
                firstAirDate={getFirstAirDate(item)}
                voteAverage={item.vote_average}
                type={type}
              />
            ))}
          </div>
          {page < totalPages && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg bg-red px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
