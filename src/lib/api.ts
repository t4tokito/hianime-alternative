import type { Anime } from './types';
import {
  getTrendingAnime,
  getPopularAnime,
  getTopAiringAnime,
  getRecentlyUpdatedAnime,
  getUpcomingAnime,
  searchAnime as anilistSearch,
  getAnimeById,
  toAnime,
  getStreamUrl,
  type AniListMedia,
} from './anilist';

// Re-export AniList types
export { getStreamUrl } from './anilist';

// ============ Server-side functions (use AniList directly) ============

export async function getHomePage() {
  const [trending, popular, topAiring, recentlyUpdated, upcoming] = await Promise.all([
    getTrendingAnime(),
    getPopularAnime(),
    getTopAiringAnime(),
    getRecentlyUpdatedAnime(),
    getUpcomingAnime(),
  ]);

  return {
    trending: trending.map(toAnime),
    popular: popular.map(toAnime),
    topAiring: topAiring.map(toAnime),
    recentlyUpdated: recentlyUpdated.map(toAnime),
    upcoming: upcoming.map(toAnime),
  };
}

export async function searchAnimeExternal(query: string, page = 1): Promise<Anime[]> {
  const results = await anilistSearch(query, page);
  return results.media.map(toAnime);
}

export async function getAnimeDetails(id: number): Promise<Anime | null> {
  const media = await getAnimeById(id);
  return media ? toAnime(media) : null;
}

// ============ Client-side functions (call our proxy routes) ============

export async function searchAnime(query: string): Promise<Anime[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getPopularAnimeClient(): Promise<Anime[]> {
  const res = await fetch('/api/popular');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ============ Utility functions ============

export function getImageUrl(anime: Anime): string {
  return anime.image || anime.poster || '';
}

export function getTitle(anime: Anime): string {
  return anime.English || anime.title || '';
}

export function getJapaneseTitle(anime: Anime): string {
  return anime.Japanese || '';
}

export function getSlug(anime: Anime): string {
  return anime.slug || anime._id || '';
}

export function getEpisodeSlug(episode: Anime): string {
  return episode.slug || '';
}

export function getWatchUrl(slug: string): string {
  return `/watch/${slug}`;
}

export function getDetailsUrl(id: string | number): string {
  return `/details/${id}`;
}
