export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres: TMDBGenre[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  credits: TMDBMovieCredits;
  similar: TMDBPaginatedResponse<TMDBMovie>;
  videos?: TMDBVideoResponse;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres: TMDBGenre[];
  number_of_seasons: number;
  number_of_episodes: number;
  tagline: string;
  status: string;
  created_by?: TMDBCreator[];
  networks?: TMDBNetwork[];
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  seasons: TMDBSeason[];
  credits: TMDBTVShowCredits;
  similar: TMDBPaginatedResponse<TMDBTVShow>;
  videos?: TMDBVideoResponse;
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBCreator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface TMDBMovieCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBTVShowCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  known_for_department: string;
  profile_path: string | null;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMultiSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity?: number;
  genre_ids: number[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBVideoResponse {
  results: TMDBVideo[];
}

export interface TMDBCollectionSearchResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TMDBCollectionDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: TMDBMovie[];
}

export type MediaType = "movie" | "tv";
export type TrendingTimeWindow = "day" | "week";
