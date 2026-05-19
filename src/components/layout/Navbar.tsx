"use client";

import Link from "next/link";
import { useState } from "react";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { SearchBar } from "@/components/shared/SearchBar";

const GENRE_LINKS = [
  { name: "All Genres", href: "/genres" },
  { name: "Collections", href: "/collections" },
  { name: "Years", href: "/years" },
  { name: "Countries", href: "/countries" },
  { name: "Networks", href: "/networks" },
  { name: "Action", href: "/genre/action" },
  { name: "Comedy", href: "/genre/comedy" },
  { name: "Drama", href: "/genre/drama" },
  { name: "Horror", href: "/genre/horror" },
  { name: "Sci-Fi", href: "/genre/sci-fi" },
  { name: "Thriller", href: "/genre/thriller" },
  { name: "Romance", href: "/genre/romance" },
  { name: "Animation", href: "/genre/animation" },
];

export function Navbar() {
  const scrollY = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const solid = scrollY > 100;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        solid ? "bg-[#111118]/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-[family-name:var(--font-syne)] text-2xl font-extrabold" aria-label="Moviebulls home">
          <span className="text-red">Movie</span>
          <span className="text-white">bulls</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-muted hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/movies" className="text-sm text-muted hover:text-white transition-colors">
            Movies
          </Link>
          <Link href="/tv" className="text-sm text-muted hover:text-white transition-colors">
            TV Shows
          </Link>
          <Link href="/my-list" className="text-sm text-muted hover:text-white transition-colors">
            My List
          </Link>
          <Link href="/random" className="text-sm text-muted hover:text-white transition-colors">
            Random
          </Link>
          <div className="relative">
            <button
              onClick={() => setGenreOpen(!genreOpen)}
              className="text-sm text-muted hover:text-white transition-colors flex items-center gap-1"
            >
              Genres
              <svg className={`w-3 h-3 transition-transform ${genreOpen ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {genreOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setGenreOpen(false)} />
                <div className="absolute top-full mt-2 right-0 bg-surface border border-border rounded-xl p-2 min-w-[160px] z-20 shadow-xl">
                  {GENRE_LINKS.map((g) => (
                    <Link
                      key={g.name}
                      href={g.href}
                      onClick={() => setGenreOpen(false)}
                      className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
          <SearchBar />
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-border px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm text-muted hover:text-white">
            Home
          </Link>
          <Link href="/movies" onClick={() => setMobileOpen(false)} className="block text-sm text-muted hover:text-white">
            Movies
          </Link>
          <Link href="/tv" onClick={() => setMobileOpen(false)} className="block text-sm text-muted hover:text-white">
            TV Shows
          </Link>
          <Link href="/my-list" onClick={() => setMobileOpen(false)} className="block text-sm text-muted hover:text-white">
            My List
          </Link>
          <Link href="/random" onClick={() => setMobileOpen(false)} className="block text-sm text-muted hover:text-white">
            Random
          </Link>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted mb-2 font-semibold">Genres</p>
            <div className="grid grid-cols-2 gap-1">
              {GENRE_LINKS.map((g) => (
                <Link
                  key={g.name}
                  href={g.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-1.5 text-sm text-muted hover:text-white rounded"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
