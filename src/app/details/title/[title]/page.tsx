import Link from "next/link";
import { searchAnimeExternal } from "@/lib/api";
import type { Anime } from "@/lib/types";

export const revalidate = 300;

export default async function AnimeDetailsByTitlePage({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);

  let anime: Anime | null = null;

  try {
    const results = await searchAnimeExternal(decodedTitle);
    if (results.length > 0) anime = results[0];
  } catch {
    // ignore
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Anime not found</h1>
          <p className="text-muted mb-4">Could not find: {decodedTitle}</p>
          <Link href="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  // Redirect to the canonical slug-based URL for SEO
  // But for now, just render the same content
  const image = anime.image || '';
  const title_ = anime.English || anime.title;
  const jpTitle = anime.Japanese || '';
  const synopsis = anime.synopsis || '';
  const genres = anime.genres || [];
  const totalSub = anime.totalSubbed || 0;
  const totalDub = anime.totalDubbed || 0;

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border">
            {image ? (
              <img src={image} alt={title_} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">{title_}</h1>
          {jpTitle && <p className="text-muted text-sm mb-4">{jpTitle}</p>}

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.Type && (
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">{anime.Type}</span>
            )}
            {anime.Status && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">{anime.Status}</span>
            )}
            {anime.Score && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">{anime.Score}</span>
            )}
            {anime.Duration && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-muted text-sm">{anime.Duration}</span>
            )}
          </div>

          <div className="flex gap-3 mb-4 text-sm">
            {totalSub > 0 && (
              <span className="px-2 py-1 rounded bg-green-300 text-black font-medium">SUB {totalSub}</span>
            )}
            {totalDub > 0 && (
              <span className="px-2 py-1 rounded bg-sky-300 text-black font-medium">DUB {totalDub}</span>
            )}
          </div>

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
              {anime.Broadcast && <p><span className="text-foreground/60">Broadcast:</span> {anime.Broadcast}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
