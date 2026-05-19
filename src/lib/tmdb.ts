import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBSeason,
  TMDBPaginatedResponse,
  TMDBMultiSearchResult,
  MediaType,
  TrendingTimeWindow,
  TMDBGenre,
  TMDBMovieCredits,
  TMDBCollectionSearchResult,
  TMDBCollectionDetails,
} from "@/types/tmdb";

const CLIENT_PROXY_BASE = "/api/tmdb";
const TMDB_API_BASE = "https://api.themoviedb.org/3";

function buildUrl(base: string, path: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params || {});
  return `${base}${path}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
}

function emptyPaginatedResponse<T>(): TMDBPaginatedResponse<T> {
  return {
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
  };
}

function isMissingTmdbToken(error: unknown) {
  return error instanceof Error && error.message === "TMDB_API_KEY not configured";
}

function shouldUseServerFallback(error: unknown) {
  return typeof window === "undefined" && (
    isMissingTmdbToken(error) ||
    (error instanceof Error && error.message.startsWith("TMDB API error:"))
  );
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>, revalidate = 3600): Promise<T> {
  const isServer = typeof window === "undefined";

  if (isServer) {
    const token = process.env.TMDB_API_KEY;

    if (!token) {
      throw new Error("TMDB_API_KEY not configured");
    }

    const res = await fetch(buildUrl(TMDB_API_BASE, path, params), {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      next: { revalidate },
    });

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  const res = await fetch(buildUrl(CLIENT_PROXY_BASE, path, params));
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function tmdbPaginatedFetch<T>(
  path: string,
  params?: Record<string, string>,
  revalidate = 3600
): Promise<TMDBPaginatedResponse<T>> {
  try {
    return await tmdbFetch<TMDBPaginatedResponse<T>>(path, params, revalidate);
  } catch (error) {
    if (shouldUseServerFallback(error)) {
      return emptyPaginatedResponse<T>();
    }
    throw error;
  }
}

export function fetchTrending(type: "movie", timeWindow?: TrendingTimeWindow, page?: number): Promise<TMDBPaginatedResponse<TMDBMovie>>;
export function fetchTrending(type: "tv", timeWindow?: TrendingTimeWindow, page?: number): Promise<TMDBPaginatedResponse<TMDBTVShow>>;
export function fetchTrending(type: MediaType, timeWindow: TrendingTimeWindow = "week", page = 1) {
  return tmdbPaginatedFetch<TMDBMovie | TMDBTVShow>(`/trending/${type}/${timeWindow}`, { page: String(page) });
}

export function fetchPopular(type: "movie", page?: number): Promise<TMDBPaginatedResponse<TMDBMovie>>;
export function fetchPopular(type: "tv", page?: number): Promise<TMDBPaginatedResponse<TMDBTVShow>>;
export function fetchPopular(type: MediaType, page = 1) {
  return tmdbPaginatedFetch<TMDBMovie | TMDBTVShow>(`/${type}/popular`, { page: String(page) });
}

export function fetchTopRated(type: "movie", page?: number): Promise<TMDBPaginatedResponse<TMDBMovie>>;
export function fetchTopRated(type: "tv", page?: number): Promise<TMDBPaginatedResponse<TMDBTVShow>>;
export function fetchTopRated(type: MediaType, page = 1) {
  return tmdbPaginatedFetch<TMDBMovie | TMDBTVShow>(`/${type}/top_rated`, { page: String(page) });
}

export function fetchNowPlaying(page = 1) {
  return tmdbPaginatedFetch<TMDBMovie>(`/movie/now_playing`, { page: String(page) });
}

export function fetchUpcoming(page = 1) {
  return tmdbPaginatedFetch<TMDBMovie>(`/movie/upcoming`, { page: String(page) });
}

export function fetchMovieDetails(id: number) {
  return tmdbFetch<TMDBMovie>(`/movie/${id}`, { append_to_response: "credits,similar,videos" }, 86400);
}

export function fetchMovieCredits(id: number) {
  return tmdbFetch<TMDBMovieCredits>(`/movie/${id}/credits`, undefined, 86400);
}

export function fetchTVDetails(id: number) {
  return tmdbFetch<TMDBTVShow>(`/tv/${id}`, { append_to_response: "credits,similar,videos" }, 86400);
}

export function fetchSeasonDetails(tvId: number, season: number) {
  return tmdbFetch<TMDBSeason>(`/tv/${tvId}/season/${season}`, undefined, 86400);
}

export function fetchSearch(query: string, page = 1) {
  return tmdbPaginatedFetch<TMDBMultiSearchResult>(`/search/multi`, { query, page: String(page) });
}

export function fetchByGenre(type: MediaType, genreId: number, page = 1) {
  return tmdbPaginatedFetch<TMDBMovie | TMDBTVShow>(`/discover/${type}`, {
    with_genres: String(genreId),
    page: String(page),
  });
}

export function fetchDiscover(
  type: MediaType,
  params: Record<string, string | number | undefined>
) {
  const cleanParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)])
  );

  return tmdbPaginatedFetch<TMDBMovie | TMDBTVShow>(`/discover/${type}`, cleanParams);
}

export function fetchOnTheAir(page = 1) {
  return tmdbPaginatedFetch<TMDBTVShow>(`/tv/on_the_air`, { page: String(page) });
}

export function fetchAiringToday(page = 1) {
  return tmdbPaginatedFetch<TMDBTVShow>(`/tv/airing_today`, { page: String(page) });
}

export function fetchSimilar(type: MediaType, id: number) {
  return tmdbPaginatedFetch<TMDBMovie | TMDBTVShow>(`/${type}/${id}/similar`, undefined, 86400);
}

export function fetchGenreList(type: MediaType) {
  return tmdbFetch<{ genres: TMDBGenre[] }>(`/genre/${type}/list`);
}

export function fetchCollectionSearch(query: string, page = 1) {
  return tmdbPaginatedFetch<TMDBCollectionSearchResult>(`/search/collection`, {
    query,
    page: String(page),
  });
}

export function fetchCollectionDetails(id: number) {
  return tmdbFetch<TMDBCollectionDetails>(`/collection/${id}`, undefined, 86400);
}
