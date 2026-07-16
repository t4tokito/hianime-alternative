import { doc, setDoc, getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

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

// ============ Firestore (Logged In) ============

async function getFirestoreHistory(userId: string): Promise<WatchProgress[]> {
  const q = query(
    collection(db, "users", userId, "watchHistory"),
    orderBy("watchedAt", "desc"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as WatchProgress);
}

async function saveFirestoreHistory(userId: string, progress: WatchProgress) {
  const docId = `${progress.animeId}_${progress.episodeNumber}`;
  await setDoc(doc(db, "users", userId, "watchHistory", docId), {
    ...progress,
    watchedAt: new Date().toISOString(),
  });
}

// ============ Public API ============

export async function getWatchHistory(userId?: string | null): Promise<WatchProgress[]> {
  if (userId) {
    return getFirestoreHistory(userId);
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

  // Also save to Firestore if logged in
  if (userId) {
    await saveFirestoreHistory(userId, progress);
  }
}

export async function migrateLocalStorageToAccount(userId: string) {
  const local = getLocalHistory();
  if (local.length === 0) return;

  for (const item of local) {
    const docId = `${item.animeId}_${item.episodeNumber}`;
    await setDoc(doc(db, "users", userId, "watchHistory", docId), {
      ...item,
      watchedAt: item.watchedAt || new Date().toISOString(),
    });
  }

  // Clear localStorage after migration
  localStorage.removeItem(STORAGE_KEY);
}
