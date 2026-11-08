"use client";

import { useEffect, useRef } from "react";

interface ScrollLoaderProps {
  hasMore: boolean;
  loading: boolean;
  error: boolean;
  onLoadMore: () => void;
}

export function ScrollLoader({ hasMore, loading, error, onLoadMore }: ScrollLoaderProps) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading || error || !sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        onLoadMore();
      }
    }, { rootMargin: "480px 0px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [error, hasMore, loading, onLoadMore]);

  return (
    <div ref={sentinel} className="mt-8 flex min-h-20 flex-col items-center justify-center gap-3 text-center text-sm text-muted" aria-live="polite" role="status">
      {error ? (
        <>
          <p>Couldn’t load titles. Please try again.</p>
          <button type="button" onClick={onLoadMore} className="min-h-11 rounded-lg border border-border bg-surface px-5 font-semibold text-white hover:border-red focus-visible:outline-2 focus-visible:outline-red">Try again</button>
        </>
      ) : loading ? (
        <span className="flex items-center gap-3"><span aria-hidden="true" className="h-4 w-4 rounded-full border-2 border-white/20 border-t-red motion-safe:animate-spin" />Loading titles…</span>
      ) : (
        <p>{hasMore ? "More titles load as you scroll" : "You’re all caught up with these results."}</p>
      )}
    </div>
  );
}
