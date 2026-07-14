"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { searchAnime } from "@/lib/api";
import type { Anime } from "@/lib/types";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAnime(query.trim());
        setSuggestions(results.slice(0, 12));
      } catch { setSuggestions([]); }
    }, 400);
  }, [query]);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1900px] mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Tokito<span className="text-primary">TV</span>
            </span>
          </Link>

          <button
            onClick={() => setShowSearch(true)}
            className="relative z-[60] w-11 h-11 flex items-center justify-center rounded-lg bg-card/50 hover:bg-card transition-colors"
            aria-label="Search"
            style={{ touchAction: 'manipulation' }}
          >
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-background">
          <div className="max-w-[1900px] mx-auto px-4 md:px-8 pt-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setShowSearch(false); setQuery(""); setSuggestions([]); }}
                className="p-2 rounded-lg hover:bg-card transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                className="flex-1 h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors text-lg"
              />
            </div>

            {query.trim().length < 2 ? (
              <div className="text-center py-20">
                <p className="text-muted">Type to search anime...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {suggestions.map((anime) => (
                  <Link
                    key={anime._id}
                    href={`/details/${anime._id}`}
                    onClick={() => setShowSearch(false)}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-card border border-border aspect-[3/4]">
                      {anime.image && (
                        <img src={anime.image} alt={anime.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      )}
                      {anime.Score && anime.Score !== "N/A" && (
                        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/80 text-black font-medium">
                          {anime.Score}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {anime.title}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
