"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Anime } from "@/lib/types";
import { getTitle, getImageUrl } from "@/lib/api";

export default function SpotlightCarousel({ items }: { items: Anime[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, isPaused, items.length]);

  if (items.length === 0) return null;

  const anime = items[current];
  const image = getImageUrl(anime);
  const title = getTitle(anime);
  const jpTitle = anime.Japanese || '';

  return (
    <div
      className="relative w-full h-[300px] md:h-[420px] lg:h-[480px] overflow-hidden rounded-2xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {items.map((item, i) => {
        const img = getImageUrl(item);
        return (
          <div
            key={item._id || i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 spotlight-active' : 'opacity-0'}`}
          >
            {img && (
              <img src={img} alt={getTitle(item)} className="absolute inset-0 h-full w-auto min-w-full object-cover object-right" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        );
      })}

      <div className="absolute inset-0 flex items-end md:items-center px-6 md:px-12 lg:px-16 pb-8 md:pb-0 z-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-1 rounded bg-primary text-white">
              #{current + 1} Spotlight
            </span>
            {anime.Type && (
              <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">{anime.Type}</span>
            )}
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 line-clamp-2">{title}</h2>
          {jpTitle && <p className="text-sm text-white/50 mb-3">{jpTitle}</p>}
          {anime.description && (
            <p className="text-sm text-white/70 line-clamp-3 mb-4 hidden md:block">{anime.description}</p>
          )}
          <div className="flex items-center gap-3">
            <Link
              href={`/details/${anime._id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Watch Now
            </Link>
            <Link
              href={`/details/${anime._id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
