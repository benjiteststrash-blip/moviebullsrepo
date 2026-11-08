"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchSearch } from "@/lib/tmdb";
import { getPosterUrl, getYear } from "@/lib/utils";
import { rankSearchResults } from "@/lib/searchRank";
import type { TMDBMultiSearchResult } from "@/types/tmdb";

function isMediaResult(result: TMDBMultiSearchResult): result is TMDBMultiSearchResult & { media_type: "movie" | "tv" } {
  return result.media_type === "movie" || result.media_type === "tv";
}
function getTitle(result: TMDBMultiSearchResult) {
  return result.media_type === "movie" ? result.title || "Untitled movie" : result.name || "Untitled show";
}
function getHref(result: TMDBMultiSearchResult) {
  return result.media_type === "movie" ? `/movie/${result.id}` : `/tv/${result.id}`;
}

export function SearchBar({ inline = false, compact = false }: { inline?: boolean; compact?: boolean }) {
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [search, setSearch] = useState<{ query: string; results: TMDBMultiSearchResult[]; error: boolean }>({ query: "", results: [], error: false });
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const trimmedQuery = query.trim();
  const showSuggestions = open && trimmedQuery.length >= 2;
  const current = search.query === trimmedQuery;
  const results = current ? search.results : [];
  const loading = showSuggestions && !current;

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open || inline || !ready) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [inline, open, ready]);

  useEffect(() => {
    if (!open || trimmedQuery.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchSearch(trimmedQuery, 1);
        if (cancelled) return;
        const seen = new Set<string>();
        const ranked = rankSearchResults(trimmedQuery, data.results.filter(isMediaResult)).filter((item) => {
          const key = `${item.media_type}-${item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSearch({ query: trimmedQuery, results: ranked.slice(0, 8), error: false });
      } catch {
        if (!cancelled) setSearch({ query: trimmedQuery, results: [], error: true });
      }
    }, 220);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [open, trimmedQuery]);

  useEffect(() => {
    if (!inline || !open) return;
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [inline, open]);

  const close = useCallback(() => { setOpen(false); setQuery(""); setActive(-1); }, []);
  const goToSearch = () => {
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    close();
  };
  const handleKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      if (!inline) triggerRef.current?.focus();
    } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length) {
      event.preventDefault();
      setOpen(true);
      const next = event.key === "ArrowDown" ? (active + 1) % results.length : active <= 0 ? results.length - 1 : active - 1;
      setActive(next);
      document.getElementById(`${id}-result-${next}`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && open && active >= 0 && results[active]) {
      event.preventDefault();
      router.push(getHref(results[active]));
      close();
    }
  };

  const content = (
    <>
      {inline && !compact && <label htmlFor={id} className="mb-3 block text-xl font-bold text-white sm:text-2xl">What do you want to watch?</label>}
      <form role="search" aria-busy={!ready} onSubmit={(event) => { event.preventDefault(); goToSearch(); }} className="relative">
        <input
          id={id} ref={inputRef} type="search" role="combobox" aria-label="Search movies and TV shows"
          aria-autocomplete="list" aria-controls={`${id}-results`} aria-expanded={showSuggestions}
          aria-activedescendant={showSuggestions && results[active] ? `${id}-result-${active}` : undefined}
          autoComplete="off" spellCheck={false} value={query} disabled={!ready}
          onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true); }}
          onKeyDown={handleKeys} placeholder={compact ? "Search titles…" : "Search movies and TV shows…"}
          className={`${compact ? "h-11 rounded-lg pl-3 pr-10" : "h-14 rounded-xl px-4 pr-14 sm:pl-5"} w-full border border-white/20 bg-surface text-base text-white outline-none transition-colors placeholder:text-white/60 focus:border-red focus:ring-2 focus:ring-red/20`}
        />
        <button type="submit" disabled={!ready} className={`absolute right-0 top-0 flex ${compact ? "h-11 w-10" : "h-14 w-14"} items-center justify-center rounded-lg text-white hover:text-red focus-visible:outline-2 focus-visible:outline-red`} aria-label="Search all results">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" /></svg>
        </button>
      </form>
      {showSuggestions && (
        <div className={`${inline ? compact ? "fixed left-4 right-4 top-16 z-50 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-[min(24rem,calc(100vw-2rem))]" : "absolute left-0 right-0 z-50" : "relative"} mt-2 overflow-hidden rounded-xl border border-white/15 bg-surface shadow-2xl`}>
          <div role="status" aria-live="polite" className={loading || !results.length ? "p-4 text-sm text-muted" : "sr-only"}>
            {loading ? "Searching titles…" : search.error ? "Couldn’t load suggestions. Try the full search below." : results.length ? `${results.length} suggestions. Use the arrow keys to choose a title.` : "No matching movies or shows. Try another title."}
          </div>
          <div id={`${id}-results`} role="listbox" aria-label="Suggested movies and TV shows" className="max-h-[min(52svh,460px)] overflow-y-auto p-1.5">
            {results.map((result, index) => {
              const title = getTitle(result);
              const poster = getPosterUrl(result.poster_path, "w300");
              const year = getYear(result.release_date || result.first_air_date || "");
              return (
                <Link key={`${result.media_type}-${result.id}`} id={`${id}-result-${index}`} href={getHref(result)} prefetch={false} role="option" aria-selected={index === active}
                  onClick={close} onMouseEnter={() => setActive(index)} tabIndex={-1}
                  className={`flex min-h-20 items-center gap-3 rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-red ${index === active ? "bg-white/10" : "hover:bg-white/5"}`}>
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-bg">{poster && <Image src={poster} alt="" fill sizes="44px" className="object-cover" />}</div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{title}</p>
                    <p className="mt-1 text-xs text-muted">{result.media_type === "movie" ? "Movie" : "TV show"}{year ? ` · ${year}` : ""}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link href={`/search?q=${encodeURIComponent(trimmedQuery)}`} prefetch={false} onClick={close} className="flex min-h-12 items-center justify-between border-t border-border px-4 text-sm font-semibold text-white hover:bg-white/5">See all results<span aria-hidden="true">→</span></Link>
        </div>
      )}
    </>
  );

  if (inline) return <div ref={rootRef} className="relative w-full max-w-3xl" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>{content}</div>;

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center text-white hover:text-red" aria-label="Search">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" /></svg>
      </button>
      {open && createPortal(
        <div ref={rootRef} role="dialog" aria-modal="true" aria-label="Search movies and TV shows" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 px-4 pt-20 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) { close(); triggerRef.current?.focus(); } }}
          onKeyDown={(event) => {
            if (event.key === "Escape") { close(); triggerRef.current?.focus(); }
            if (event.key !== "Tab") return;
            const targets = rootRef.current?.querySelectorAll<HTMLElement>('input, button, a:not([tabindex="-1"])');
            if (!targets?.length) return;
            const first = targets[0]; const last = targets[targets.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }}>
          <div className="mx-auto max-w-2xl">{content}<button type="button" onClick={() => { close(); triggerRef.current?.focus(); }} className="mt-4 min-h-11 px-3 text-sm text-white hover:text-red">Close search</button></div>
        </div>, document.body
      )}
    </>
  );
}
