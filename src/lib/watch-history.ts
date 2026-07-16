import { supabase } from "./supabase";

export interface WatchProgress {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  episodeNumber: number;
  totalEpisodes: number;
  malId?: number;
  watchedAt: string;
}

const STORAGE_KEY = "tokitotv_watch_history";

// ============ LocalStorage (Guest) ============

function getLocalHistory(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(history: WatchProgress[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// ============ Supabase (Logged In) ============

async function getSupabaseHistory(userId: string): Promise<WatchProgress[]> {
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .limit(20);

  return (data || []).map((row) => ({
    animeId: row.anime_id,
    animeTitle: row.anime_title,
    animeImage: row.anime_image || "",
    episodeNumber: row.episode_number,
    totalEpisodes: row.total_episodes || 0,
    malId: row.mal_id,
    watchedAt: row.watched_at,
  }));
}

async function saveSupabaseHistory(userId: string, progress: WatchProgress) {
  await supabase.from("watch_history").upsert(
    {
      user_id: userId,
      anime_id: progress.animeId,
      anime_title: progress.animeTitle,
      anime_image: progress.animeImage,
      episode_number: progress.episodeNumber,
      total_episodes: progress.totalEpisodes,
      mal_id: progress.malId,
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,anime_id,episode_number" }
  );
}

// ============ Public API ============

export async function getWatchHistory(userId?: string | null): Promise<WatchProgress[]> {
  if (userId) {
    return getSupabaseHistory(userId);
  }
  return getLocalHistory();
}

export async function saveWatchProgress(
  progress: WatchProgress,
  userId?: string | null
) {
  // Always save to localStorage as backup
  const local = getLocalHistory();
  const existing = local.findIndex(
    (h) => h.animeId === progress.animeId && h.episodeNumber === progress.episodeNumber
  );
  if (existing >= 0) {
    local[existing] = { ...local[existing], watchedAt: new Date().toISOString() };
  } else {
    local.unshift(progress);
  }
  saveLocalHistory(local.slice(0, 50));

  // Also save to Supabase if logged in
  if (userId) {
    await saveSupabaseHistory(userId, progress);
  }
}

export async function migrateLocalStorageToAccount(userId: string) {
  const local = getLocalHistory();
  if (local.length === 0) return;

  const rows = local.map((item) => ({
    user_id: userId,
    anime_id: item.animeId,
    anime_title: item.animeTitle,
    anime_image: item.animeImage,
    episode_number: item.episodeNumber,
    total_episodes: item.totalEpisodes,
    mal_id: item.malId,
    watched_at: item.watchedAt || new Date().toISOString(),
  }));

  await supabase.from("watch_history").upsert(rows, {
    onConflict: "user_id,anime_id,episode_number",
  });

  // Clear localStorage after migration
  localStorage.removeItem(STORAGE_KEY);
}
