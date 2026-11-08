"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TMDBPaginatedResponse } from "@/types/tmdb";

export function useInfiniteMedia<T>(
  loadPage: (page: number) => Promise<TMDBPaginatedResponse<T>>,
  getKey: (item: T) => string | number,
  initialData?: TMDBPaginatedResponse<T>,
) {
  const [state, setState] = useState(() => ({
    items: initialData?.results || [],
    page: initialData?.page || 0,
    totalPages: Math.min(initialData?.total_pages || 1, 500),
    loading: !initialData,
    error: false,
  }));
  const generation = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    const version = ++generation.current;
    busy.current = false;
    const timer = window.setTimeout(async () => {
      setState({
        items: initialData?.results || [],
        page: initialData?.page || 0,
        totalPages: Math.min(initialData?.total_pages || 1, 500),
        loading: !initialData,
        error: false,
      });
      if (initialData) return;
      busy.current = true;
      try {
        const data = await loadPage(1);
        if (generation.current !== version) return;
        setState({ items: data.results, page: data.page, totalPages: Math.min(data.total_pages, 500), loading: false, error: false });
      } catch {
        if (generation.current === version) setState((current) => ({ ...current, loading: false, error: true }));
      } finally {
        if (generation.current === version) busy.current = false;
      }
    }, 0);
    return () => {
      generation.current = version + 1;
      window.clearTimeout(timer);
    };
  }, [initialData, loadPage]);

  const loadMore = useCallback(async () => {
    if (busy.current || state.loading || state.page >= state.totalPages) return;
    busy.current = true;
    const version = generation.current;
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const data = await loadPage(state.page + 1);
      if (generation.current !== version) return;
      setState((current) => {
        const seen = new Set(current.items.map(getKey));
        const added = data.results.filter((item) => {
          const key = getKey(item);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return {
          items: [...current.items, ...added],
          page: data.page,
          totalPages: data.results.length ? Math.min(data.total_pages, 500) : data.page,
          loading: false,
          error: false,
        };
      });
    } catch {
      if (generation.current === version) setState((current) => ({ ...current, loading: false, error: true }));
    } finally {
      if (generation.current === version) busy.current = false;
    }
  }, [getKey, loadPage, state.loading, state.page, state.totalPages]);

  return { ...state, loadMore, hasMore: state.page < state.totalPages };
}
