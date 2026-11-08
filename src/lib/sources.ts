export interface Source {
  name: string;
  reliability: "primary" | "fallback" | "last-resort";
  url: (...args: number[]) => string;
}

export const MOVIE_SOURCES: Source[] = [
  { name: "VidSrc Primary", reliability: "primary", url: (id: number) => `/embed/movie/${id}/` },
];

export const TV_SOURCES: Source[] = [
  { name: "VidSrc Primary", reliability: "primary", url: (id: number, s: number, e: number) => `/embed/tv/${id}/${s}/${e}/` },
];
