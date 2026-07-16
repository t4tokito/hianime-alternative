"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Anime } from "@/lib/types";

const STREAM_SERVERS = [
  { name: "Server 1", base: "https://animeplay.cfd/stream/mal" },
  { name: "Server 2", base: "https://zokoanime.video/stream/mal" },
];

export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"sub" | "dub">("sub");
  const [activeServer, setActiveServer] = useState(0);
  const [currentEp, setCurrentEp] = useState(1);
  const [streamError, setStreamError] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [tryingFallback, setTryingFallback] = useState(false);

  // Parse slug to get anime ID and episode number
  // Pattern: "anilist-{id}-episode-{num}" or "{id}-episode-{num}"
  const parseSlug = (s: string) => {
    const epMatch = s.match(/episode-(\d+)/);
    const epNum = epMatch ? parseInt(epMatch[1], 10) : 1;
    const animeSlug = s.replace(/-episode-\d+.*$/, '');
    const idMatch = animeSlug.match(/(\d+)$/);
    const anilistId = idMatch ? parseInt(idMatch[1], 10) : null;
    return { anilistId, epNum, animeSlug };
  };

  const { anilistId, epNum } = parseSlug(slug);
  useEffect(() => { setCurrentEp(epNum); setStreamError(false); setFallbackUrl(null); setTryingFallback(false); }, [epNum]);

  useEffect(() => {
    if (!anilistId) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetch(`/api/anime/${anilistId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setAnime(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [anilistId]);

  const malId = anime?.mal_id;
  const totalEps = anime?.episodes || 0;

  // Build stream URL: try direct servers first, then fallback
  const directUrl = malId
    ? `${STREAM_SERVERS[activeServer].base}/${malId}/${currentEp}/${activeTab}`
    : '';
  const streamUrl = fallbackUrl || directUrl;

  const handleStreamError = useCallback(() => {
    if (tryingFallback) return; // Don't loop
    // Try next direct server
    if (activeServer < STREAM_SERVERS.length - 1) {
      setActiveServer(activeServer + 1);
    } else if (!fallbackUrl && malId) {
      // All direct servers failed, try animedata.cfd fallback
      setTryingFallback(true);
      fetch(`/api/fallback-stream?malId=${malId}&episode=${currentEp}&type=${activeTab}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.episode?.link) {
            const links = activeTab === "dub" ? data.episode.link.dub : data.episode.link.sub;
            if (links?.length > 0) {
              setFallbackUrl(links[0]);
            } else {
              setStreamError(true);
            }
          } else {
            setStreamError(true);
          }
        })
        .catch(() => setStreamError(true))
        .finally(() => setTryingFallback(false));
    } else {
      setStreamError(true);
    }
  }, [activeServer, fallbackUrl, malId, currentEp, activeTab, tryingFallback]);

  const handleServerChange = useCallback((tab: "sub" | "dub") => {
    setActiveTab(tab);
    setActiveServer(0);
    setStreamError(false);
    setFallbackUrl(null);
    setTryingFallback(false);
  }, []);

  const getWatchUrl = (ep: number) => {
    return `/watch/${slug.replace(/episode-\d+/, `episode-${ep}`)}`;
  };

  const title = anime?.English || anime?.title || '';

  if (loading) {
    return (
      <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
        <div className="skeleton aspect-video rounded-xl mb-4" />
        <div className="skeleton h-8 w-64 rounded mb-2" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Failed to load</h1>
          <p className="text-muted mb-4">Could not find anime data for this episode</p>
          <Link href="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          {streamUrl && !streamError ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border">
              <iframe
                key={`${malId}-${currentEp}-${activeTab}-${activeServer}`}
                src={streamUrl}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                referrerPolicy="no-referrer"
                onError={handleStreamError}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-3">
              <svg className="w-16 h-16 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-foreground font-medium">Stream not available</p>
              <p className="text-muted text-sm text-center max-w-md">
                This episode is not available on our streaming servers yet.
                Try other episodes or check back later.
              </p>
              {!malId && <p className="text-muted text-xs">MAL ID not found for this anime</p>}
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Episode {currentEp}{title ? ` - ${title}` : ''}
              </h1>
              <Link href={`/details/${anime._id}`} className="text-sm text-primary hover:underline">
                {title}
              </Link>
            </div>
            <div className="flex gap-2">
              {currentEp > 1 && (
                <Link
                  href={getWatchUrl(currentEp - 1)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:border-primary transition-colors"
                >
                  &larr; Prev
                </Link>
              )}
              {currentEp < totalEps && (
                <Link
                  href={getWatchUrl(currentEp + 1)}
                  className="px-4 py-2 rounded-lg bg-primary text-foreground text-sm hover:bg-primary/80 transition-colors"
                >
                  Next &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          {/* Server Selector */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => handleServerChange("sub")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "sub" ? "bg-primary text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Sub
              </button>
              <button
                onClick={() => handleServerChange("dub")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "dub" ? "bg-primary text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                Dub
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted mb-2 uppercase tracking-wider">Servers</p>
              <div className="space-y-1.5">
                {STREAM_SERVERS.map((server, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveServer(idx)}
                    className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      activeServer === idx
                        ? "bg-primary text-foreground"
                        : "bg-surface text-foreground hover:bg-card-hover"
                    }`}
                  >
                    {server.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Episode Grid */}
          {totalEps > 0 && (
            <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted">{totalEps} episodes</p>
              </div>
              <div className="p-3 grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                {Array.from({ length: totalEps }, (_, i) => i + 1).map((ep) => (
                  <Link
                    key={ep}
                    href={getWatchUrl(ep)}
                    className={`flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors ${
                      ep === currentEp
                        ? "bg-primary text-foreground ring-2 ring-primary/50"
                        : "bg-surface text-foreground hover:bg-card-hover border border-border"
                    }`}
                  >
                    {ep}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
