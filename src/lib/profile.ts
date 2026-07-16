import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const PROFILE_PICS = [
  "/profile_pics/23432860625098735.jpeg",
  "/profile_pics/534309943317450948.jpeg",
  "/profile_pics/989877193123640090.jpeg",
  "/profile_pics/Denji.jpeg",
  "/profile_pics/luka-stressed.jpeg",
  "/profile_pics/لوفيوو.jpeg",
];

export interface UserProfile {
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

export function getRandomAvatar(): string {
  const idx = Math.floor(Math.random() * PROFILE_PICS.length);
  return PROFILE_PICS[idx];
}

export function getProfilePics(): string[] {
  return PROFILE_PICS;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, profile: UserProfile) {
  await setDoc(doc(db, "users", uid), profile, { merge: true });
}

export async function initUserProfile(uid: string, displayName: string) {
  const existing = await getUserProfile(uid);
  if (!existing) {
    await setUserProfile(uid, {
      displayName,
      avatarUrl: getRandomAvatar(),
      createdAt: new Date().toISOString(),
    });
  }
}
