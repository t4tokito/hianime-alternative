"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEpisodeDetails, getLatestEpisodes } from "@/lib/api";
import type { Anime, EpisodeData } from "@/lib/types";

export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [animeEpisodes, setAnimeEpisodes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"sub" | "dub">("sub");
  const [activeServer, setActiveServer] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEpisodeData(null);
    setActiveServer(0);

    getEpisodeDetails(slug)
      .then((data) => {
        setEpisodeData(data);
        if (data.episode?.link?.dub?.length === 0) setActiveTab("sub");

        // Fetch episodes for THIS specific anime
        const animeId = data.episode?.anime_id;
        if (animeId && typeof animeId === 'object' && animeId._id) {
          getLatestEpisodes(1, 200)
            .then((epData) => {
              const filtered = (epData.episodes || []).filter((ep: Anime) => {
                const epAnime = ep.anime_id;
                if (epAnime && typeof epAnime === 'object' && (epAnime as Anime)._id === animeId._id) return true;
                return false;
              });
              setAnimeEpisodes(filtered);
            })
            .catch(() => {});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const links = episodeData?.episode?.link;
  const currentLinks = activeTab === "dub" ? links?.dub : links?.sub;
  const currentUrl = currentLinks?.[activeServer] || currentLinks?.[0] || '';

  const animeInfo = episodeData?.episode?.anime_id;
  const epNumber = episodeData?.episode?.episodeNumber;
  const epTitle = episodeData?.episode?.title || '';

  const currentIdx = animeEpisodes.findIndex((ep) => ep.slug === slug);
  const prevEp = currentIdx > 0 ? animeEpisodes[currentIdx - 1] : null;
  const nextEp = currentIdx < animeEpisodes.length - 1 ? animeEpisodes[currentIdx + 1] : null;

  const handleServerChange = useCallback((tab: "sub" | "dub") => {
    setActiveTab(tab);
    setActiveServer(0);
  }, []);

  const detailsSlug = (animeInfo && typeof animeInfo === 'object')
    ? (animeInfo as Anime)._id || ''
    : '';

  if (loading) {
    return (
      <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
        <div className="skeleton aspect-video rounded-xl mb-4" />
        <div className="skeleton h-8 w-64 rounded mb-2" />
        <div className="skeleton h-4 w-96 rounded" />
      </div>
    );
  }

  if (error || !episodeData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Failed to load episode</h1>
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
          {currentUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border">
              <iframe
                src={currentUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center">
              <p className="text-muted">No stream available</p>
            </div>
          )}

          {/* Episode Title + Nav */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {epTitle || `Episode ${epNumber || ''}`}
              </h1>
              {animeInfo && typeof animeInfo === 'object' && (
                <Link
                  href={detailsSlug ? `/details/${detailsSlug}` : '#'}
                  className="text-sm text-primary hover:underline"
                >
                  {(animeInfo as Anime).title || ''}
                </Link>
              )}
            </div>
            <div className="flex gap-2">
              {prevEp && (
                <Link
                  href={`/watch/${prevEp.slug}`}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:border-primary transition-colors"
                >
                  &larr; Prev
                </Link>
              )}
              {nextEp && (
                <Link
                  href={`/watch/${nextEp.slug}`}
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
                  activeTab === "sub"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Sub ({links?.sub?.length || 0})
              </button>
              <button
                onClick={() => handleServerChange("dub")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "dub"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Dub ({links?.dub?.length || 0})
              </button>
            </div>

            <div className="p-3">
              <p className="text-xs text-muted mb-2 uppercase tracking-wider">Servers</p>
              <div className="space-y-1.5">
                {(activeTab === "sub" ? links?.sub : links?.dub)?.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveServer(idx)}
                    className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      activeServer === idx
                        ? "bg-primary text-white"
                        : "bg-surface text-foreground hover:bg-card-hover"
                    }`}
                  >
                    Server {idx + 1}
                  </button>
                ))}
                {(!links?.sub?.length && !links?.dub?.length) && (
                  <p className="text-sm text-muted py-4 text-center">No servers available</p>
                )}
              </div>
            </div>
          </div>

          {/* Episode Grid - like hianime.se */}
          {animeEpisodes.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {typeof animeInfo === 'object' && animeInfo ? (animeInfo as Anime).title : 'Episodes'}
                </p>
                <p className="text-xs text-muted">{animeEpisodes.length} episodes</p>
              </div>
              <div className="p-3 grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                {animeEpisodes.map((ep, idx) => (
                  <Link
                    key={`${ep.slug}-${idx}`}
                    href={`/watch/${ep.slug}`}
                    className={`flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors ${
                      ep.slug === slug
                        ? "bg-primary text-white ring-2 ring-primary/50"
                        : "bg-surface text-foreground hover:bg-card-hover border border-border"
                    }`}
                  >
                    {ep.episodeNumber || idx + 1}
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
