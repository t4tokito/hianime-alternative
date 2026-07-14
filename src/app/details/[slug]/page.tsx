import Link from "next/link";
import { getAnimeById, toAnime } from "@/lib/anilist";
import { searchAnimeExternal } from "@/lib/api";
import type { Anime } from "@/lib/types";
import AnimeGrid from "@/components/AnimeGrid";

export const revalidate = 300;

export default async function AnimeDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let anime: Anime | null = null;

  // 1. Try as AniList ID (e.g. "anilist-20" or just "20")
  const numericId = parseInt(decodedSlug.replace("anilist-", ""), 10);
  if (!isNaN(numericId)) {
    try {
      const media = await getAnimeById(numericId);
      if (media) anime = toAnime(media);
    } catch {
      // ignore
    }
  }

  // 2. Search by title as fallback
  if (!anime) {
    try {
      const searchTerm = decodedSlug
        .replace(/-episode-\d+.*$/, '')
        .replace(/-/g, ' ')
        .trim();
      if (searchTerm.length > 1) {
        const results = await searchAnimeExternal(searchTerm);
        if (results.length > 0) anime = results[0];
      }
    } catch {
      // ignore
    }
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Anime not found</h1>
          <Link href="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const image = anime.image;
  const title = anime.English || anime.title;
  const jpTitle = anime.Japanese;
  const synopsis = anime.description;
  const genres = anime.genres || [];
  const episodes = anime.episodes || 0;
  const related = anime.related || [];
  const recommended = anime.recommended || [];
  const characters = anime.characters || [];

  // First episode number for Watch Now
  const firstEpUrl = `/watch/${anime._id}-episode-1`;

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      {/* Banner - full width on mobile, hidden on desktop */}
      {anime.bannerImage && (
        <div className="block md:hidden relative w-full h-[200px] rounded-xl overflow-hidden mb-4">
          <img src={anime.bannerImage} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-10">
        {/* Cover - hidden on mobile, show on desktop */}
        <div className="hidden md:block md:w-[300px] lg:w-[350px] flex-shrink-0">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">{title}</h1>
          {jpTitle && <p className="text-muted text-sm mb-4">{jpTitle}</p>}

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.Type && (
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">{anime.Type}</span>
            )}
            {anime.Status && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">{anime.Status}</span>
            )}
            {anime.Score && anime.Score !== "N/A" && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">{anime.Score}</span>
            )}
            {anime.Duration && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-muted text-sm">{anime.Duration}</span>
            )}
          </div>

          <div className="flex gap-3 mb-4 text-sm">
            {episodes > 0 && (
              <span className="px-2 py-1 rounded bg-white/10 text-muted">{episodes} Episodes</span>
            )}
            {anime.studios && (
              <span className="px-2 py-1 rounded bg-white/10 text-muted">{anime.studios}</span>
            )}
          </div>

          {episodes > 0 && (
            <Link
              href={firstEpUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Watch Now
            </Link>
          )}

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/search?q=${genre}`}
                  className="px-2.5 py-1 rounded-full bg-card border border-border text-xs text-muted hover:text-foreground hover:border-primary transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}

          {synopsis && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Synopsis</h3>
              <p className="text-foreground/80 text-sm leading-relaxed">{synopsis}</p>
            </div>
          )}

          {anime.Aired && (
            <div className="text-sm text-muted space-y-1">
              <p><span className="text-foreground/60">Aired:</span> {anime.Aired}</p>
              {anime.Broadcast && <p><span className="text-foreground/60">Season:</span> {anime.Broadcast}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Characters */}
      {characters.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground mb-4">Characters</h2>
          <div className="flex gap-4 overflow-x-auto scroll-container pb-2">
            {characters.slice(0, 12).map((char) => (
              <div key={char.name} className="flex-shrink-0 w-[100px] text-center">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-card border border-border mx-auto mb-2">
                  {char.image ? (
                    <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">?</div>
                  )}
                </div>
                <p className="text-xs text-foreground line-clamp-2">{char.name}</p>
                <p className="text-[10px] text-muted">{char.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground mb-4">Related</h2>
          <div className="flex gap-4 overflow-x-auto scroll-container pb-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/details/${r.id}`}
                className="flex-shrink-0 w-[150px] group"
              >
                <div className="w-[150px] h-[200px] rounded-xl overflow-hidden bg-card border border-border mb-2">
                  {r.image ? (
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs p-2 text-center">{r.title}</div>
                  )}
                </div>
                <p className="text-xs text-foreground line-clamp-2">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground mb-4">Recommended</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {recommended.map((r) => (
              <Link key={r.id} href={`/details/${r.id}`} className="group block">
                <div className="relative overflow-hidden rounded-xl bg-card border border-border aspect-[3/4]">
                  {r.image ? (
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs p-2 text-center">{r.title}</div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
