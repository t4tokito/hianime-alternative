import { getHomePage } from "@/lib/api";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import AnimeGrid from "@/components/AnimeGrid";
import HorizontalScroll from "@/components/HorizontalScroll";
import Link from "next/link";

export const revalidate = 300;

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
  "Thriller", "Mecha", "Isekai", "Shounen",
];

export default async function HomePage() {
  let homeData;
  try {
    homeData = await getHomePage();
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

  const spotlight = homeData.featured || [];
  const trending = homeData.trending?.animes || [];
  const popular = homeData.popular?.animes || [];
  const currentlyAiring = homeData.currentlyAiring?.animes || [];
  const finishedAiring = homeData.finishedAiring?.animes || [];
  const latestEpisodes = homeData.latestEpisodes?.episodes || [];

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      <SpotlightCarousel items={spotlight} />

      <div className="mt-8">
        <HorizontalScroll animes={trending} title="Trending" />
      </div>

      <AnimeGrid animes={popular} title="Most Popular" limit={12} />

      <HorizontalScroll animes={currentlyAiring} title="Currently Airing" />

      <AnimeGrid
        animes={latestEpisodes}
        title="Latest Episodes"
        limit={12}
      />

      <AnimeGrid animes={finishedAiring} title="Completed Series" limit={12} />

      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
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
