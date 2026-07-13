"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEpisodeDetails } from "@/lib/api";
import type { Anime, EpisodeData } from "@/lib/types";

interface JikanEpisode {
  mal_id: number;
  number: number;
  title: string;
  title_japanese?: string;
  aired: string;
  score?: number;
}

const STREAM_SERVERS = [
  { name: "Server 1", base: "https://zokoanime.video/stream/mal" },
  { name: "Server 2", base: "https://animeplay.cfd/stream/mal" },
];

export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [jikanEpisodes, setJikanEpisodes] = useState<JikanEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"sub" | "dub">("sub");
  const [activeServer, setActiveServer] = useState(0);
  const [malId, setMalId] = useState<number | null>(null);
  const [totalEpisodes, setTotalEpisodes] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEpisodeData(null);
    setActiveServer(0);
    setJikanEpisodes([]);
    setMalId(null);

    getEpisodeDetails(slug)
      .then(async (data) => {
        setEpisodeData(data);
        if (data.episode?.link?.dub?.length === 0) setActiveTab("sub");

        const animeIdRaw = data.episode?.anime_id;
        let foundMalId: number | null = null;

        if (typeof animeIdRaw === 'object' && animeIdRaw !== null) {
          foundMalId = animeIdRaw.mal_id || null;
        }

        if (!foundMalId) {
          setLoading(false);
          return;
        }

        setMalId(foundMalId);

        // Fetch episode list from Jikan API (MAL)
        try {
          const allEps: JikanEpisode[] = [];
          for (let page = 1; page <= 10; page++) {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${foundMalId}/episodes?page=${page}`);
            if (!res.ok) break;
            const jikanData = await res.json();
            const eps = jikanData.data || [];
            if (eps.length === 0) break;
            allEps.push(...eps);
            if (!jikanData.pagination?.has_next_page) break;
            // Jikan rate limit: 3 req/sec
            await new Promise(r => setTimeout(r, 400));
          }
          setJikanEpisodes(allEps);
          setTotalEpisodes(allEps.length || (allEps.length > 0 ? allEps[allEps.length - 1].number : 0));
        } catch {
          // Jikan failed, continue without episode list
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const links = episodeData?.episode?.link;
  const currentLinks = activeTab === "dub" ? links?.dub : links?.sub;

  // Build stream URL from pattern
  const currentEpNumber = episodeData?.episode?.episodeNumber;
  const streamUrl = malId && currentEpNumber
    ? `${STREAM_SERVERS[activeServer].base}/${malId}/${currentEpNumber}/${activeTab}`
    : currentLinks?.[activeServer] || currentLinks?.[0] || '';

  const animeInfo = episodeData?.episode?.anime_id;
  const epTitle = episodeData?.episode?.title || '';

  const animeTitle = (animeInfo && typeof animeInfo === 'object')
    ? (animeInfo as Anime).title || ''
    : '';
  const detailsSlug = (animeInfo && typeof animeInfo === 'object')
    ? (animeInfo as Anime)._id || ''
    : '';

  const handleServerChange = useCallback((tab: "sub" | "dub") => {
    setActiveTab(tab);
    setActiveServer(0);
  }, []);

  const handleServerIdxChange = useCallback((idx: number) => {
    setActiveServer(idx);
  }, []);

  // Find current episode index in Jikan list
  const currentJikanIdx = jikanEpisodes.findIndex(e => e.number === currentEpNumber);
  const prevEpNumber = currentJikanIdx > 0 ? jikanEpisodes[currentJikanIdx - 1].number : null;
  const nextEpNumber = currentJikanIdx >= 0 && currentJikanIdx < jikanEpisodes.length - 1
    ? jikanEpisodes[currentJikanIdx + 1].number : null;

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

  // Generate watch URLs for episodes using the slug pattern
  const getWatchUrl = (epNum: number) => {
    // We need to construct a valid slug that the episode endpoint can resolve
    // Use the current anime name + episode number pattern
    const animeName = animeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `/watch/${animeName}-episode-${epNum}`;
  };

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          {streamUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border">
              <iframe
                src={streamUrl}
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

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {epTitle || `Episode ${currentEpNumber || ''}`}
              </h1>
              {animeTitle && (
                <Link
                  href={detailsSlug ? `/details/${detailsSlug}` : '#'}
                  className="text-sm text-primary hover:underline"
                >
                  {animeTitle}
                </Link>
              )}
            </div>
            <div className="flex gap-2">
              {prevEpNumber && (
                <Link
                  href={getWatchUrl(prevEpNumber)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:border-primary transition-colors"
                >
                  &larr; Prev
                </Link>
              )}
              {nextEpNumber && (
                <Link
                  href={getWatchUrl(nextEpNumber)}
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
                    onClick={() => handleServerIdxChange(idx)}
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

          {/* Episode Grid from Jikan */}
          {jikanEpisodes.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{animeTitle || 'Episodes'}</p>
                <p className="text-xs text-muted">{jikanEpisodes.length} episodes</p>
              </div>
              <div className="p-3 grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                {jikanEpisodes.map((ep) => (
                  <Link
                    key={ep.mal_id}
                    href={getWatchUrl(ep.number)}
                    className={`flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors ${
                      ep.number === currentEpNumber
                        ? "bg-primary text-white ring-2 ring-primary/50"
                        : "bg-surface text-foreground hover:bg-card-hover border border-border"
                    }`}
                  >
                    {ep.number}
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
