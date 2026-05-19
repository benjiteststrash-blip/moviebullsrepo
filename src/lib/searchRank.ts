import type { TMDBMultiSearchResult } from "@/types/tmdb";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getTitle(result: TMDBMultiSearchResult) {
  return result.title || result.name || "";
}

function getDate(result: TMDBMultiSearchResult) {
  return result.release_date || result.first_air_date || "";
}

function yearScore(date: string) {
  const year = Number(date.slice(0, 4));
  if (!year) return 0;
  const current = new Date().getFullYear();
  const distance = Math.abs(current - year);
  if (distance <= 2) return 260 - distance * 20;
  if (year > current) return 220;
  return Math.max(0, 170 - distance * 7);
}

export function rankSearchResults(query: string, results: TMDBMultiSearchResult[]) {
  const needle = normalize(query);

  return [...results].sort((a, b) => {
    const titleA = normalize(getTitle(a));
    const titleB = normalize(getTitle(b));

    const score = (item: TMDBMultiSearchResult, title: string) => {
      let value = 0;
      if (title === needle) value += 500;
      if (title.startsWith(needle)) value += 360;
      if (title.includes(needle)) value += 240;
      value += Math.min(item.popularity || 0, 250);
      value += yearScore(getDate(item));
      value += (item.vote_average || 0) * 4;
      if (item.poster_path) value += 35;
      return value;
    };

    return score(b, titleB) - score(a, titleA);
  });
}
