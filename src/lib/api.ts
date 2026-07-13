import type { HomeData, EpisodeData, Anime } from './types';

const EXTERNAL_API = 'https://animedata.cfd/api';

// Server-side fetch (used in server components / API routes)
async function fetchExternal<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${EXTERNAL_API}${endpoint}`, {
    ...options,
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Server-only functions (used in server components)
export async function getHomePage(): Promise<HomeData> {
  return fetchExternal<HomeData>('/home');
}

export async function searchAnimeExternal(title: string): Promise<Anime[]> {
  return fetchExternal<Anime[]>('/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export async function getPopularAnimeExternal(): Promise<Anime[]> {
  return fetchExternal<{ animes: Anime[] }>('/anime/popular').then(d => d.animes);
}

export async function getEpisodeDetailsExternal(slug: string): Promise<EpisodeData> {
  return fetchExternal<EpisodeData>(`/episode/${slug}`);
}

export async function getLatestEpisodesExternal(page = 1, limit = 24) {
  return fetchExternal<{ episodes: Anime[]; currentPage: number; totalPages: number; total: number }>(
    `/latest/episode?page=${page}&limit=${limit}`
  );
}

// Client-side functions (call our /api proxy to avoid CORS)
export async function searchAnime(title: string): Promise<Anime[]> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getPopularAnime(): Promise<Anime[]> {
  const res = await fetch('/api/popular');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.animes || [];
}

export async function getEpisodeDetails(slug: string): Promise<EpisodeData> {
  const res = await fetch(`/api/episode?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getLatestEpisodes(page = 1, limit = 24) {
  const res = await fetch(`/api/latest-episode?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Shared utility functions
export function getImageUrl(anime: Anime): string {
  return anime.image || anime.poster || anime.anime_info?.image || '';
}

export function getTitle(anime: Anime): string {
  return anime.title || anime.English || '';
}

export function getJapaneseTitle(anime: Anime): string {
  return anime.Japanese || anime.anime_info?.Japanese || '';
}

export function getSlug(anime: Anime): string {
  return anime.slug || anime.slugs?.[10] || '';
}

export function getEpisodeSlug(episode: Anime): string {
  return episode.slug || '';
}

export function getWatchUrl(slug: string): string {
  return `/watch/${slug}`;
}

export function getDetailsUrl(slug: string): string {
  return `/details/${slug}`;
}
