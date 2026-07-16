"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth";
import { getWatchHistory, WatchProgress } from "@/lib/watch-history";

function getAvatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4A70A9,8FABD4,0D0D0D&textColor=EFECE3&fontSize=40`;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      getWatchHistory(user.uid).then(setHistory);
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name.trim() });
      setMessage("Name updated!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Failed to update name");
    }
    setSaving(false);
  };

  if (authLoading || !user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const uniqueAnime = new Set(history.map((h) => h.animeId)).size;
  const totalEpisodes = history.length;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <img
            src={user.photoURL || getAvatarUrl(displayName)}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
          />
          <div className="flex-1">
            <p className="text-foreground font-medium">{displayName}</p>
            <p className="text-muted text-sm">{user.email}</p>
            <p className="text-muted text-xs mt-1">
              Member since {new Date(user.metadata.creationTime || "").toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{uniqueAnime}</p>
          <p className="text-xs text-muted mt-1">Anime Watched</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{totalEpisodes}</p>
          <p className="text-xs text-muted mt-1">Episodes Watched</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{uniqueAnime > 0 ? Math.round(totalEpisodes / uniqueAnime) : 0}</p>
          <p className="text-xs text-muted mt-1">Avg Ep/Anime</p>
        </div>
      </div>

      {/* Edit Name */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Display Name</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="flex-1 h-10 px-4 bg-surface border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSaveName}
            disabled={saving || name === (user.displayName || "")}
            className="px-5 h-10 bg-primary text-foreground text-sm font-medium rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {message && <p className="text-sm text-secondary mt-2">{message}</p>}
      </div>

      {/* Watch History */}
      {history.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Recent Watch History</h2>
          <div className="space-y-3">
            {history.slice(0, 10).map((item) => (
              <div key={`${item.animeId}-${item.episodeNumber}`} className="flex items-center gap-3">
                {item.animeImage && (
                  <img src={item.animeImage} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-1">{item.animeTitle}</p>
                  <p className="text-xs text-muted">Episode {item.episodeNumber}</p>
                </div>
                <p className="text-xs text-muted flex-shrink-0">
                  {new Date(item.watchedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
