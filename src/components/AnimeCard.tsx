import Link from "next/link";
import type { Anime } from "@/lib/types";
import { getImageUrl, getTitle } from "@/lib/api";

export default function AnimeCard({ anime, href }: { anime: Anime; href?: string }) {
  const image = getImageUrl(anime);
  const title = getTitle(anime);

  // AniList IDs are in format "anilist-{id}" or just the _id
  const link = href || (anime._id ? `/details/${anime._id}` : '#');

  return (
    <Link href={link} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-card border border-border aspect-[3/4]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {anime.Type && (
          <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/80 text-white font-medium">
            {anime.Type}
          </span>
        )}
        {anime.Score && anime.Score !== "N/A" && (
          <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/80 text-black font-medium">
            {anime.Score}
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {anime.episodes && anime.episodes > 0 && (
          <p className="text-xs text-muted mt-0.5">{anime.episodes} eps</p>
        )}
      </div>
    </Link>
  );
}
