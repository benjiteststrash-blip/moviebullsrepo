"use client";

import { useCallback, useMemo, useState } from "react";
import {
  fetchAiringToday,
  fetchDiscover,
  fetchNowPlaying,
  fetchOnTheAir,
  fetchPopular,
  fetchTopRated,
  fetchTrending,
  fetchUpcoming,
  getRecentMovieParams,
} from "@/lib/tmdb";
import { MOVIE_GENRES, TV_GENRES, YEARS } from "@/lib/catalog";
import { MovieCard } from "@/components/shared/MovieCard";
import { ScrollLoader } from "@/components/shared/ScrollLoader";
import { useInfiniteMedia } from "@/hooks/useInfiniteMedia";
import type { MediaType, TMDBMovie, TMDBTVShow, TMDBPaginatedResponse } from "@/types/tmdb";

type BrowserMode = "recent" | "popular" | "trending" | "top_rated" | "newest" | "now_playing" | "upcoming" | "on_air" | "airing_today";
type MediaItem = TMDBMovie | TMDBTVShow;

interface MediaBrowserProps {
  type: MediaType;
  title: string;
  subtitle?: string;
  initialGenreId?: number;
  initialYear?: string;
  fixedParams?: Record<string, string | number>;
  initialMode?: BrowserMode;
  initialData?: TMDBPaginatedResponse<MediaItem>;
  embedded?: boolean;
}

const MOVIE_MODES: { label: string; value: BrowserMode }[] = [
  { label: "New & popular", value: "recent" },
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Popular", value: "popular" },
  { label: "Top Rated", value: "top_rated" },
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

function mediaKey(item: MediaItem) { return item.id; }

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MediaBrowser({ type, title, subtitle, initialGenreId, initialYear, fixedParams, initialMode, initialData, embedded = false }: MediaBrowserProps) {
  const modes = type === "movie" ? MOVIE_MODES : TV_MODES;
  const genres = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const defaultMode = initialMode || (type === "movie" && !initialYear ? "recent" : "popular");
  const [mode, setMode] = useState<BrowserMode>(defaultMode);
  const [genreId, setGenreId] = useState(initialGenreId ? String(initialGenreId) : "");
  const [year, setYear] = useState(initialYear || "");

  const hasFilters = Boolean(genreId || year || fixedParams);

  const discoverParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      sort_by: mode === "top_rated" ? "vote_average.desc" : mode === "newest" ? (type === "movie" ? "primary_release_date.desc" : "first_air_date.desc") : "popularity.desc",
      with_genres: genreId || undefined,
      "vote_count.gte": mode === "top_rated" ? 100 : undefined,
      ...fixedParams,
    };

    if (mode === "recent") Object.assign(params, getRecentMovieParams());

    if (year) {
      params[type === "movie" ? "primary_release_year" : "first_air_date_year"] = year;
      delete params["primary_release_date.gte"];
    }

    if (mode === "newest") {
      params[type === "movie" ? "primary_release_date.lte" : "first_air_date.lte"] = today();
      params["vote_count.gte"] = 10;
    }

    return params;
  }, [fixedParams, genreId, mode, type, year]);

  const loadPage = useCallback(async (nextPage: number) => {
    if (hasFilters || mode === "newest" || mode === "recent") {
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

  const seed = mode === defaultMode && !genreId && !year && !fixedParams ? initialData : undefined;
  const { items, loading, error, hasMore, loadMore } = useInfiniteMedia(loadPage, mediaKey, seed);
  const Heading = embedded ? "h2" : "h1";

  return (
    <section className={`mx-auto max-w-7xl px-4 pb-12 sm:px-6 ${embedded ? "pt-6" : "pt-24"}`} aria-label={title}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {!embedded && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red">Browse</p>}
          <Heading className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white sm:text-3xl">{title}</Heading>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>}
        </div>
        {!embedded && <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-2xl lg:flex-wrap lg:justify-end">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setMode(item.value);
              }}
              aria-pressed={mode === item.value}
              className={`min-h-11 shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-red ${
                mode === item.value ? "bg-red text-white" : "border border-border bg-surface text-muted hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>}
      </div>

      {!embedded && <div className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-3 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Genre</span>
          <select
            value={genreId}
            onChange={(event) => setGenreId(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-red"
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
            className="min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-red"
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
              setMode(defaultMode);
            }}
            className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-white"
          >
            Reset Filters
          </button>
        </div>
        <div className="flex items-end text-xs text-muted">
          {items.length > 0 ? `${items.length} titles${hasMore ? " · Keep scrolling for more" : ""}` : "Find your next watch"}
        </div>
      </div>}

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-label="Loading titles" aria-busy="true">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : items.length === 0 && !error ? (
        <div className="rounded-lg border border-border bg-surface py-12 text-center">
          <p className="text-muted">No titles found. Try a broader filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-busy={loading}>
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
        </>
      )}
      <ScrollLoader hasMore={hasMore} loading={loading} error={error} onLoadMore={loadMore} />
    </section>
  );
}
