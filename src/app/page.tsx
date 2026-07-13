import { getTrendingAnime, getPopularAnime, getTopAiringAnime, getRecentlyUpdatedAnime, getUpcomingAnime } from "@/lib/anilist";
import { toAnime } from "@/lib/anilist";
import AnimeGrid from "@/components/AnimeGrid";
import HorizontalScroll from "@/components/HorizontalScroll";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  let data;
  try {
    const [trendingRaw, popularRaw, topAiringRaw, recentlyUpdatedRaw, upcomingRaw] = await Promise.all([
      getTrendingAnime(),
      getPopularAnime(),
      getTopAiringAnime(),
      getRecentlyUpdatedAnime(),
      getUpcomingAnime(),
    ]);
    data = {
      trending: trendingRaw.map(toAnime),
      popular: popularRaw.map(toAnime),
      topAiring: topAiringRaw.map(toAnime),
      recentlyUpdated: recentlyUpdatedRaw.map(toAnime),
      upcoming: upcomingRaw.map(toAnime),
    };
  } catch {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted">Failed to load anime data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const trending = data.trending;
  const popular = data.popular;
  const topAiring = data.topAiring;
  const recentlyUpdated = data.recentlyUpdated;
  const upcoming = data.upcoming;

  // Use trending as spotlight
  const spotlight = trending.slice(0, 5).map((a) => ({ anime: a }));

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      {/* Spotlight Hero */}
      <SpotlightHero items={spotlight} />

      <div className="mt-8">
        <HorizontalScroll animes={trending} title="Trending Now" />
      </div>

      <AnimeGrid animes={popular} title="Most Popular" limit={12} />

      <HorizontalScroll animes={topAiring} title="Top Airing" />

      <AnimeGrid animes={recentlyUpdated} title="Recently Updated" limit={12} />

      <AnimeGrid animes={upcoming} title="Upcoming" limit={12} />

      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller", "Mecha", "Isekai", "Shounen"].map((genre) => (
            <Link
              key={genre}
              href={`/search?q=${genre}`}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-muted hover:text-foreground hover:border-primary transition-colors"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// Inline spotlight component
import type { Anime } from "@/lib/types";
import { getTitle, getImageUrl } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

function SpotlightHero({ items }: { items: { anime: Anime }[] }) {
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

  const anime = items[current].anime;
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
        const img = getImageUrl(item.anime);
        return (
          <div
            key={item.anime._id || i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 spotlight-active' : 'opacity-0'}`}
          >
            {img && (
              <img src={img} alt={getTitle(item.anime)} className="w-full h-full object-cover" />
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
