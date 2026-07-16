"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { searchAnime } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/profile";
import type { Anime } from "@/lib/types";

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const doSearch = useCallback(() => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  }, [query, router]);

  useEffect(() => {
    function handleInteraction(e: MouseEvent | TouchEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Fetch user avatar from Firestore
  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        if (profile?.avatarUrl) setAvatarUrl(profile.avatarUrl);
      });
    }
  }, [user]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAnime(value.trim());
        setSuggestions(results.slice(0, 8));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1900px] mx-auto flex items-center gap-3 px-4 md:px-8 h-16">
        <Link href="/" className="flex items-center flex-shrink-0">
          <img src="/logo.jpg" alt="TokitoTV" className="h-8" />
        </Link>

        <div ref={searchRef} className="relative flex-1 max-w-[500px]">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  doSearch();
                }
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search anime..."
              className="w-full h-10 px-4 pr-10 bg-card border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={doSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-card-hover transition-colors"
            >
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
              {suggestions.map((anime) => (
                <Link
                  key={anime._id}
                  href={`/details/${anime._id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-card-hover transition-colors"
                >
                  <img
                    src={anime.image || ''}
                    alt={anime.title}
                    className="w-10 h-14 object-cover rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{anime.title}</p>
                    <p className="text-xs text-muted">{anime.Type || ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Auth Section */}
        {user ? (
          <div ref={userMenuRef} className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-foreground font-bold text-sm hover:bg-primary/80 transition-colors overflow-hidden"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : user.email?.charAt(0).toUpperCase()}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">{user.displayName || user.email}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-card-hover transition-colors"
                >
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    await signOut(auth);
                    setShowUserMenu(false);
                    router.push("/");
                    router.refresh();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card-hover transition-colors border-t border-border"
                >
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex-shrink-0 px-4 py-2 bg-primary text-foreground text-sm font-medium rounded-lg hover:bg-primary/80 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
