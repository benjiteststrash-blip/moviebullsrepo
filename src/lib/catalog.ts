import type { MediaType } from "@/types/tmdb";

export const MOVIE_GENRES = [
  { id: 28, name: "Action", slug: "action" },
  { id: 12, name: "Adventure", slug: "adventure" },
  { id: 16, name: "Animation", slug: "animation" },
  { id: 35, name: "Comedy", slug: "comedy" },
  { id: 80, name: "Crime", slug: "crime" },
  { id: 99, name: "Documentary", slug: "documentary" },
  { id: 18, name: "Drama", slug: "drama" },
  { id: 10751, name: "Family", slug: "family" },
  { id: 14, name: "Fantasy", slug: "fantasy" },
  { id: 36, name: "History", slug: "history" },
  { id: 27, name: "Horror", slug: "horror" },
  { id: 10402, name: "Music", slug: "music" },
  { id: 9648, name: "Mystery", slug: "mystery" },
  { id: 10749, name: "Romance", slug: "romance" },
  { id: 878, name: "Sci-Fi", slug: "sci-fi" },
  { id: 53, name: "Thriller", slug: "thriller" },
  { id: 10752, name: "War", slug: "war" },
  { id: 37, name: "Western", slug: "western" },
];

export const TV_GENRES = [
  { id: 10759, name: "Action & Adventure", slug: "action-adventure" },
  { id: 16, name: "Animation", slug: "animation" },
  { id: 35, name: "Comedy", slug: "comedy" },
  { id: 80, name: "Crime", slug: "crime" },
  { id: 99, name: "Documentary", slug: "documentary" },
  { id: 18, name: "Drama", slug: "drama" },
  { id: 10751, name: "Family", slug: "family" },
  { id: 10762, name: "Kids", slug: "kids" },
  { id: 9648, name: "Mystery", slug: "mystery" },
  { id: 10763, name: "News", slug: "news" },
  { id: 10764, name: "Reality", slug: "reality" },
  { id: 10765, name: "Sci-Fi & Fantasy", slug: "sci-fi-fantasy" },
  { id: 10766, name: "Soap", slug: "soap" },
  { id: 10767, name: "Talk", slug: "talk" },
  { id: 10768, name: "War & Politics", slug: "war-politics" },
  { id: 37, name: "Western", slug: "western" },
];

export const YEARS = Array.from({ length: 36 }, (_, index) => String(new Date().getFullYear() - index));

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
];

export const NETWORKS = [
  { id: 213, name: "Netflix" },
  { id: 1024, name: "Amazon" },
  { id: 2739, name: "Disney+" },
  { id: 453, name: "Hulu" },
  { id: 49, name: "HBO" },
  { id: 3186, name: "HBO Max" },
  { id: 2552, name: "Apple TV+" },
  { id: 4330, name: "Paramount+" },
  { id: 3353, name: "Peacock" },
  { id: 67, name: "Showtime" },
  { id: 174, name: "AMC" },
  { id: 19, name: "FOX" },
];

export const COLLECTIONS = [
  "Harry Potter",
  "The Fast and the Furious",
  "Mission: Impossible",
  "James Bond",
  "Star Wars",
  "Jurassic Park",
  "The Lord of the Rings",
  "The Hobbit",
  "Pirates of the Caribbean",
  "Transformers",
  "Spider-Man",
  "Batman",
  "Avengers",
  "X-Men",
  "Toy Story",
  "Shrek",
  "John Wick",
  "The Conjuring",
];

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getGenreBySlug(slug: string, type: MediaType) {
  const list = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  return list.find((genre) => genre.slug === slug);
}

export function collectionNameFromSlug(slug: string) {
  return COLLECTIONS.find((name) => slugify(name) === slug) || slug.replace(/-/g, " ");
}
