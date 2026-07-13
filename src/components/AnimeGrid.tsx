import type { Anime } from "@/lib/types";
import AnimeCard from "./AnimeCard";

export default function AnimeGrid({
  animes,
  title,
  href,
  limit = 12,
}: {
  animes: Anime[];
  title?: string;
  href?: string;
  limit?: number;
}) {
  const items = animes.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {href && (
            <a href={href} className="text-sm text-primary hover:text-primary/80 transition-colors">
              View More &rarr;
            </a>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {items.map((anime, i) => (
          <AnimeCard key={anime._id || anime.mal_id || i} anime={anime} />
        ))}
      </div>
    </section>
  );
}
