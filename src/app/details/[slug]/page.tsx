import Link from "next/link";
import { getHomePage, getImageUrl, getSlug } from "@/lib/api";
import { searchAnimeExternal, getLatestEpisodesExternal } from "@/lib/api";
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
  let allAnime: Anime[] = [];
  let homeData: Awaited<ReturnType<typeof getHomePage>> | null = null;

  // 1. Try finding by slug in home page data
  try {
    homeData = await getHomePage();
    allAnime = [
      ...homeData.trending?.animes || [],
      ...homeData.popular?.animes || [],
      ...homeData.currentlyAiring?.animes || [],
      ...homeData.finishedAiring?.animes || [],
      ...homeData.latestAnime?.animes || [],
    ];
    anime = allAnime.find((a) => {
      const aSlug = getSlug(a);
      return aSlug === decodedSlug || aSlug === slug || a._id === decodedSlug;
    }) || null;
  } catch {
    // ignore
  }

  // 2. Try finding by _id directly
  if (!anime) {
    anime = allAnime.find((a) => a._id === decodedSlug) || null;
  }

  // 3. Search by converting slug to readable title
  if (!anime) {
    try {
      const titleFromSlug = decodedSlug
        .replace(/-episode-\d+.*$/, '')
        .replace(/-[a-z0-9]{6}$/, '')
        .replace(/:/g, ' ')
        .replace(/-/g, ' ')
        .trim();
      if (titleFromSlug.length > 2) {
        const results = await searchAnimeExternal(titleFromSlug);
        if (results.length > 0) anime = results[0];
      }
    } catch {
      // ignore
    }
  }

  // 4. Last resort: full slug as search
  if (!anime) {
    try {
      const searchTerm = decodedSlug.replace(/:/g, ' ').replace(/-/g, ' ').trim();
      if (searchTerm.length > 2) {
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
          <p className="text-muted mb-4">Could not find anime with slug: {decodedSlug}</p>
          <Link href="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const image = getImageUrl(anime);
  const title = anime.English || anime.title;
  const jpTitle = anime.Japanese || anime.anime_info?.Japanese || '';
  const synopsis = anime.synopsis || anime.anime_info?.synopsis || anime.description || '';
  const genres = anime.Genres || anime.genres || anime.anime_info?.genres || [];
  const episodes = typeof anime.episodes === 'number' ? anime.episodes : (anime.Episodes || 0);
  const totalSub = anime.totalSubbed || 0;
  const totalDub = anime.totalDubbed || 0;

  // Get episodes embedded in the anime object itself
  const animeEpisodes = Array.isArray(anime.episodes) ? anime.episodes : [];
  const firstEpSlug = animeEpisodes.length > 0 ? animeEpisodes[animeEpisodes.length - 1]?.slug : null;

  // Also try latest episodes from the API
  let latestEpisodes: Anime[] = [];
  try {
    const epData = await getLatestEpisodesExternal(1, 100);
    latestEpisodes = (epData.episodes || []).filter((ep) => {
      const epAnime = ep.anime_id;
      if (epAnime && typeof epAnime === 'object' && (epAnime as Anime).title === anime!.title) return true;
      if (epAnime && typeof epAnime === 'string' && epAnime === anime!._id) return true;
      return false;
    });
  } catch {
    // ignore
  }

  // Use latestEpisodes as fallback for episode list
  const displayEpisodes = latestEpisodes.length > 0 ? latestEpisodes : animeEpisodes;

  const related = allAnime
    .filter((a) => {
      const aGenres = a.Genres || a.genres || [];
      return a._id !== anime!._id && aGenres.some((g) => genres.includes(g));
    })
    .slice(0, 6);

  return (
    <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
            {title}
          </h1>
          {jpTitle && (
            <p className="text-muted text-sm mb-4">{jpTitle}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.Type && (
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                {anime.Type}
              </span>
            )}
            {anime.Status && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                {anime.Status}
              </span>
            )}
            {anime.Score && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                {anime.Score}
              </span>
            )}
            {anime.Duration && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-muted text-sm">
                {anime.Duration}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {totalSub > 0 && (
              <span className="px-2 py-1 rounded bg-green-300 text-black font-medium">
                SUB {totalSub}
              </span>
            )}
            {totalDub > 0 && (
              <span className="px-2 py-1 rounded bg-sky-300 text-black font-medium">
                DUB {totalDub}
              </span>
            )}
            {episodes > 0 && (
              <span className="px-2 py-1 rounded bg-white/10 text-muted">
                {episodes} Episodes
              </span>
            )}
          </div>

          {firstEpSlug && (
            <Link
              href={`/watch/${firstEpSlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
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

          {displayEpisodes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Episodes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {displayEpisodes.slice(0, 12).map((ep, idx) => (
                  <Link
                    key={ep.slug || ep.episodeNumber || idx}
                    href={`/watch/${ep.slug}`}
                    className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:border-primary hover:bg-card-hover transition-colors text-center"
                  >
                    Ep {ep.episodeNumber}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {anime.Aired && (
            <div className="text-sm text-muted space-y-1">
              <p><span className="text-foreground/60">Aired:</span> {anime.Aired}</p>
              {anime.Broadcast && <p><span className="text-foreground/60">Broadcast:</span> {anime.Broadcast}</p>}
              {anime.Source && <p><span className="text-foreground/60">Source:</span> {anime.Source}</p>}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <AnimeGrid animes={related} title="Related Anime" limit={6} />
        </div>
      )}
    </div>
  );
}
