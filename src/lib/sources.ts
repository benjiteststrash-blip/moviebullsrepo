export interface Source {
  name: string;
  reliability: "primary" | "fallback" | "last-resort";
  url: (...args: number[]) => string;
}

export const MOVIE_SOURCES: Source[] = [
  { name: "VidSrc Wiki", reliability: "primary", url: (id: number) => `https://vidsrc.wiki/embed/movie/${id}?autoplay=1&color=dc2626` },
];

export const TV_SOURCES: Source[] = [
  { name: "VidSrc Wiki", reliability: "primary", url: (id: number, s: number, e: number) => `https://vidsrc.wiki/embed/tv/${id}/${s}/${e}?autoplay=1&color=dc2626` },
];
