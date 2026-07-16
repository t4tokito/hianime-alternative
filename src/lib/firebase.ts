import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB55FcD56ySCXxJaHx_fEdY5MREsZEmTQk",
  authDomain: "tokito-tv.firebaseapp.com",
  projectId: "tokito-tv",
  storageBucket: "tokito-tv.firebasestorage.app",
  messagingSenderId: "403021898232",
  appId: "1:403021898232:web:7fc0cb3cb7a32cdecdb60d",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
