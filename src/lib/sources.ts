export type SourceProtectionMode = "protected" | "compatibility";

export interface Source {
  name: string;
  reliability: "primary" | "fallback" | "last-resort";
  url: (...args: number[]) => string;
}

export const PROTECTED_IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-forms allow-presentation";

export const MOVIE_SOURCES: Source[] = [
  { name: "VidSrc.me", reliability: "primary", url: (id: number) => `https://vidsrc.me/embed/movie/${id}` },
  { name: "VidLink", reliability: "primary", url: (id: number) => `https://vidlink.pro/movie/${id}?primaryColor=dc2626&autoplay=true` },
  { name: "VidSrc Wiki", reliability: "fallback", url: (id: number) => `https://vidsrc.wiki/embed/movie/${id}?autoplay=1&color=dc2626` },
  { name: "2Embed.skin", reliability: "fallback", url: (id: number) => `https://2embed.skin/embed/${id}` },
  { name: "VidSrc FYI", reliability: "fallback", url: (id: number) => `https://vidsrc.fyi/embed/movie/${id}` },
  { name: "VidSrc Mov", reliability: "fallback", url: (id: number) => `https://vidsrc.mov/embed/movie/${id}` },
  { name: "VidSrc", reliability: "last-resort", url: (id: number) => `https://vidsrc.to/embed/movie/${id}` },
  { name: "2Embed", reliability: "last-resort", url: (id: number) => `https://www.2embed.cc/embed/${id}` },
];

export const TV_SOURCES: Source[] = [
  { name: "VidSrc.me", reliability: "primary", url: (id: number, s: number, e: number) => `https://vidsrc.me/embed/tv/${id}/${s}/${e}` },
  { name: "VidLink", reliability: "primary", url: (id: number, s: number, e: number) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=dc2626&autoplay=true` },
  { name: "VidSrc Wiki", reliability: "fallback", url: (id: number, s: number, e: number) => `https://vidsrc.wiki/embed/tv/${id}/${s}/${e}?autoplay=1&color=dc2626` },
  { name: "2Embed.skin", reliability: "fallback", url: (id: number, s: number, e: number) => `https://2embed.skin/embedtv/${id}&s=${s}&e=${e}` },
  { name: "VidSrc FYI", reliability: "fallback", url: (id: number, s: number, e: number) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}` },
  { name: "VidSrc Mov", reliability: "fallback", url: (id: number, s: number, e: number) => `https://vidsrc.mov/embed/tv/${id}/${s}/${e}` },
  { name: "VidSrc", reliability: "last-resort", url: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
  { name: "2Embed", reliability: "last-resort", url: (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
];
