import type { Anime } from "@/lib/types";
import AnimeCard from "./AnimeCard";

export default function HorizontalScroll({
  animes,
  title,
  href,
}: {
  animes: Anime[];
  title?: string;
  href?: string;
}) {
  if (animes.length === 0) return null;

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
      <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-container pb-2">
        {animes.map((anime, i) => (
          <div key={anime._id || anime.mal_id || i} className="flex-shrink-0 w-[140px] md:w-[160px]">
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    </section>
  );
}
