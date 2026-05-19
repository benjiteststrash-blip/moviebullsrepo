"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface RecentlyViewedRecorderProps {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function RecentlyViewedRecorder({ tmdbId, type, title, posterPath }: RecentlyViewedRecorderProps) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      add({ tmdb_id: tmdbId, type, title, poster_path: posterPath });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [add, posterPath, title, tmdbId, type]);

  return null;
}
