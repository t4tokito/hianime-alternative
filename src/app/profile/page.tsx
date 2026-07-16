"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth";
import { getWatchHistory, WatchProgress } from "@/lib/watch-history";

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

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSaving(true);
    try {
      // Convert to base64 data URL for simplicity
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await updateProfile(user, { photoURL: dataUrl });
        setMessage("Profile picture updated!");
        setTimeout(() => setMessage(""), 2000);
        setSaving(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage("Failed to update picture");
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  // Stats
  const uniqueAnime = new Set(history.map((h) => h.animeId)).size;
  const totalEpisodes = history.length;
  const uniqueTypes = new Map<string, number>();
  history.forEach((h) => {
    const type = h.animeId.includes("movie") ? "Movies" : "Series";
    uniqueTypes.set(type, (uniqueTypes.get(type) || 0) + 1);
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-foreground text-2xl font-bold overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                user.email?.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" onChange={handlePfpChange} className="hidden" />
            </label>
          </div>
          <div className="flex-1">
            <p className="text-foreground font-medium">{user.displayName || "No name set"}</p>
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
          <p className="text-2xl font-bold text-foreground">{history.length > 0 ? Math.round(totalEpisodes / uniqueAnime) : 0}</p>
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
        {message && (
          <p className="text-sm text-secondary mt-2">{message}</p>
        )}
      </div>

      {/* Watch History Summary */}
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
