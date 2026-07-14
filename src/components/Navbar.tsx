"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchAnime } from "@/lib/api";
import type { Anime } from "@/lib/types";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchAnime(value.trim());
        setSuggestions(results.slice(0, 8));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
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

        <div ref={searchRef} className="relative hidden md:block w-[350px] lg:w-[450px]">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search anime..."
              className="w-full h-10 px-4 pr-10 bg-card border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
              {suggestions.map((anime) => (
                <Link
                  key={anime._id || anime.mal_id}
                  href={anime._id ? `/details/${anime._id}` : anime.slug ? `/details/${anime.slug}` : `/details/title/${encodeURIComponent(anime.title)}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-card-hover transition-colors"
                >
                  <img
                    src={anime.image || ''}
                    alt={anime.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{anime.title}</p>
                    <p className="text-xs text-muted">{anime.Type || ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" className="text-sm text-muted hover:text-foreground transition-colors hidden md:block">
            Browse
          </Link>
          <Link href="/schedule" className="text-sm text-muted hover:text-foreground transition-colors hidden md:block">
            Schedule
          </Link>
        </div>
      </div>
    </nav>
  );
}
