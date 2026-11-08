"use client";

import { useMemo, useSyncExternalStore } from "react";

export interface WatchedItem {
  tmdb_id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  watched_at: number;
  season?: number;
  episode?: number;
}

const KEY = "moviebulls_recently_watched";
const CHANGED = "moviebulls-watched-changed";
const positiveId = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 999999999;

function parse(raw: string): WatchedItem[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data.filter((item): item is WatchedItem => {
      if (!item || !positiveId(item.tmdb_id) || !["movie", "tv"].includes(item.type) || typeof item.title !== "string" || !item.title.trim() || item.title.length > 250 || !Number.isFinite(item.watched_at)) return false;
      if (item.poster_path !== null && (typeof item.poster_path !== "string" || !/^\/[a-zA-Z0-9._/-]+$/.test(item.poster_path))) return false;
      if (item.type === "tv" && (!positiveId(item.season) || !positiveId(item.episode) || item.season > 9999 || item.episode > 9999)) return false;
      const key = `${item.type}-${item.tmdb_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 24);
  } catch { return []; }
}

function snapshot() {
  try { return localStorage.getItem(KEY) || "[]"; }
  catch { return "[]"; }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGED, listener);
  window.addEventListener("pageshow", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener("pageshow", listener);
  };
}

export function recordRecentlyWatched(item: Omit<WatchedItem, "watched_at">) {
  const next = parse(JSON.stringify([{ ...item, watched_at: Date.now() }, ...parse(snapshot()).filter((entry) => !(entry.type === item.type && entry.tmdb_id === item.tmdb_id))]));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGED));
  } catch { /* Playback still works when browser storage is unavailable. */ }
}

export function useRecentlyWatched() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  return useMemo(() => parse(raw), [raw]);
}
