export function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatVoteAverage(vote: number): string {
  return vote ? vote.toFixed(1) : "N/A";
}

export function getYear(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.split("-")[0];
}

export function getPosterUrl(path: string | null, size: "w500" | "w300" = "w500"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w1280${path}`;
}

export function getStillUrl(path: string | null): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w300${path}`;
}

export const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  fantasy: 14,
  horror: 27,
  romance: 10749,
  "sci-fi": 878,
  thriller: 53,
};
