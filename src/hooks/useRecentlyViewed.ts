"use client";

import { useCallback, useEffect, useState } from "react";

export interface RecentItem {
  tmdb_id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  viewed_at: number;
}

const RECENT_KEY = "moviebulls_recently_viewed";
const LEGACY_RECENT_KEY = "streamsite_recently_viewed";

function readRecentKey(key: string): RecentItem[] {
  const parsed = JSON.parse(localStorage.getItem(key) || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

function getRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];

  try {
    const current = readRecentKey(RECENT_KEY);
    if (current.length) return current;

    const legacy = readRecentKey(LEGACY_RECENT_KEY);
    if (legacy.length) {
      localStorage.setItem(RECENT_KEY, JSON.stringify(legacy.slice(0, 24)));
      localStorage.removeItem(LEGACY_RECENT_KEY);
    }

    return legacy;
  } catch {
    return [];
  }
}

function setRecent(items: RecentItem[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 24)));
  localStorage.removeItem(LEGACY_RECENT_KEY);
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>(getRecent);

  useEffect(() => {
    const sync = () => setItems(getRecent());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const add = useCallback((item: Omit<RecentItem, "viewed_at">) => {
    const current = getRecent().filter((entry) => !(entry.tmdb_id === item.tmdb_id && entry.type === item.type));
    const updated = [{ ...item, viewed_at: Date.now() }, ...current];
    setRecent(updated);
    setItems(updated.slice(0, 24));
  }, []);

  return { items, add };
}
