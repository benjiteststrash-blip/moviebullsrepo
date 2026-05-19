"use client";

import { useState, useCallback, useEffect } from "react";

interface WatchlistItem {
  tmdb_id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
}

const WATCHLIST_KEY = "moviebulls_watchlist";
const LEGACY_WATCHLIST_KEY = "streamsite_watchlist";

function readWatchlistKey(key: string): WatchlistItem[] {
  const parsed = JSON.parse(localStorage.getItem(key) || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

function getLocalWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = readWatchlistKey(WATCHLIST_KEY);
    if (current.length) return current;

    const legacy = readWatchlistKey(LEGACY_WATCHLIST_KEY);
    if (legacy.length) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(legacy));
      localStorage.removeItem(LEGACY_WATCHLIST_KEY);
    }

    return legacy;
  } catch {
    return [];
  }
}

function setLocalWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
  localStorage.removeItem(LEGACY_WATCHLIST_KEY);
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(getLocalWatchlist);

  useEffect(() => {
    const sync = () => setItems(getLocalWatchlist());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const isInWatchlist = useCallback(
    (tmdbId: number, type?: "movie" | "tv") =>
      items.some((i) => i.tmdb_id === tmdbId && (!type || i.type === type)),
    [items]
  );

  const toggle = useCallback((item: WatchlistItem) => {
    const current = getLocalWatchlist();
    const exists = current.some((i) => i.tmdb_id === item.tmdb_id && i.type === item.type);
    const updated = exists
      ? current.filter((i) => !(i.tmdb_id === item.tmdb_id && i.type === item.type))
      : [...current, item];

    setLocalWatchlist(updated);
    setItems(updated);
  }, []);

  return { items, isInWatchlist, toggle };
}
