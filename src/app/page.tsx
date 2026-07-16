import { getTrendingAnime, getPopularAnime, getTopAiringAnime, getRecentlyUpdatedAnime, getUpcomingAnime } from "@/lib/anilist";
import { toAnime } from "@/lib/anilist";
import AnimeGrid from "@/components/AnimeGrid";
import HorizontalScroll from "@/components/HorizontalScroll";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import ContinueWatching from "@/components/ContinueWatching";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TokitoTV - Watch Anime Online Free | Tokito Anime Hub",
  description:
    "Watch anime online for free on TokitoTV. Stream the latest subbed and dubbed anime episodes. Your ultimate Tokito Anime Hub for trending, popular, and top airing anime.",
  openGraph: {
    title: "TokitoTV - Watch Anime Online Free",
    description:
      "Watch anime online for free. Stream subbed and dubbed anime episodes without ads.",
  },
};

export const revalidate = 300;

export default async function HomePage() {
  let data;
  try {
    const [trendingRaw, popularRaw, topAiringRaw, recentlyUpdatedRaw, upcomingRaw] = await Promise.all([
      getTrendingAnime().catch(() => []),
      getPopularAnime().catch(() => []),
      getTopAiringAnime().catch(() => []),
      getRecentlyUpdatedAnime().catch(() => []),
      getUpcomingAnime().catch(() => []),
    ]);
    data = {
      trending: trendingRaw.map(toAnime),
      popular: popularRaw.map(toAnime),
      topAiring: topAiringRaw.map(toAnime),
      recentlyUpdated: recentlyUpdatedRaw.map(toAnime),
      upcoming: upcomingRaw.map(toAnime),
    };
  } catch (e) {
    console.error("Home page error:", e);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted">Failed to load anime data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      <SpotlightCarousel items={data.trending.slice(0, 5)} />

      <div className="mt-8">
        <ContinueWatching />
      </div>

      <div className="mt-8">
        <HorizontalScroll animes={data.trending} title="Trending Now" />
      </div>

      <AnimeGrid animes={data.popular} title="Most Popular" limit={12} />

      <HorizontalScroll animes={data.topAiring} title="Top Airing" />

      <AnimeGrid animes={data.recentlyUpdated} title="Recently Updated" limit={12} />

      <AnimeGrid animes={data.upcoming} title="Upcoming" limit={12} />

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
