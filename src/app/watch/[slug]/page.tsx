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
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border group">
              {/* iframe - completely blocked from interaction */}
              <iframe
                key={`${malId}-${currentEp}-${activeTab}-${activeServer}`}
                src={streamUrl}
                className="w-full h-full"
                style={{ pointerEvents: 'none' }}
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                referrerPolicy="no-referrer"
                onError={handleStreamError}
              />

              {/* Custom Controls Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end">
                {/* Gradient background for controls */}
                <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pb-3 px-4">
                  {/* Progress bar placeholder */}
                  <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer">
                    <div className="h-full bg-primary rounded-full w-0 transition-all" />
                  </div>

                  {/* Controls row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <button
                        onClick={() => {
                          const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                          if (iframe?.contentWindow) {
                            iframe.contentWindow.postMessage('play', '*');
                          }
                        }}
                        className="text-white hover:text-primary transition-colors"
                      >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>

                      {/* 10s Backward */}
                      <button
                        onClick={() => {
                          const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                          if (iframe?.contentWindow) {
                            iframe.contentWindow.postMessage('seek:-10', '*');
                          }
                        }}
                        className="text-white/70 hover:text-white transition-colors"
                        title="10s back"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                        </svg>
                      </button>

                      {/* 10s Forward */}
                      <button
                        onClick={() => {
                          const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                          if (iframe?.contentWindow) {
                            iframe.contentWindow.postMessage('seek:10', '*');
                          }
                        }}
                        className="text-white/70 hover:text-white transition-colors"
                        title="10s forward"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                        </svg>
                      </button>

                      {/* Volume */}
                      <button className="text-white/70 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.05zM14 3.23v2.06c2.89.86 5 3.54 5 6.78s-2.11 5.93-5 6.78v2.06c4.01-.91 7-4.49 7-8.78s-2.99-7.87-7-8.78z"/>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Captions */}
                      <button className="text-white/70 hover:text-white transition-colors text-xs font-bold border border-white/30 px-1.5 py-0.5 rounded">
                        CC
                      </button>

                      {/* Settings */}
                      <button className="text-white/70 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                        </svg>
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={() => {
                          const container = document.querySelector('.aspect-video')?.parentElement;
                          if (container) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            } else {
                              container.requestFullscreen();
                            }
                          }
                        }}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
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
                  activeTab === "sub" ? "bg-primary text-white" : "text-muted hover:text-foreground"
                }`}
              >
                Sub
              </button>
              <button
                onClick={() => handleServerChange("dub")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "dub" ? "bg-primary text-white" : "text-muted hover:text-foreground"
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
                        ? "bg-primary text-white"
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
                        ? "bg-primary text-white ring-2 ring-primary/50"
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
