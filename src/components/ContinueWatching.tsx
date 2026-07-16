"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getWatchHistory, WatchProgress } from "@/lib/watch-history";

export default function ContinueWatching() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getWatchHistory(user?.uid).then((data) => {
      setHistory(data);
      setLoaded(true);
    });
  }, [user]);

  if (!loaded || history.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Continue Watching</h2>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-container pb-2">
        {history.map((item) => {
          const nextEp = item.episodeNumber + 1;
          const watchUrl = `/watch/${item.animeId}-episode-${nextEp <= item.totalEpisodes ? nextEp : item.episodeNumber}`;
          const progress = item.totalEpisodes > 0 ? (item.episodeNumber / item.totalEpisodes) * 100 : 0;

          return (
            <Link
              key={`${item.animeId}-${item.episodeNumber}`}
              href={watchUrl}
              className="flex-shrink-0 w-[160px] md:w-[180px] group"
            >
              <div className="relative overflow-hidden rounded-xl bg-card border border-border aspect-[3/4]">
                {item.animeImage ? (
                  <img
                    src={item.animeImage}
                    alt={item.animeTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{
                      objectPosition: `${10 + (item.episodeNumber % 5) * 20}% center`,
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Colored gradient overlay per episode */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(item.episodeNumber * 47) % 360}, 60%, 30%) 0%, transparent 60%)`,
                  }}
                />
                {/* Episode number badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-foreground text-xs font-bold">
                  EP {item.episodeNumber}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.animeTitle}
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Episode {item.episodeNumber} of {item.totalEpisodes}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
