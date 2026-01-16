// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithCustomToken,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore 
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAJblChg4w8fC1pWkwNn_Bp1PmUTlHlPb8",
  authDomain: "holobots-24046.firebaseapp.com",
  projectId: "holobots-24046",
  storageBucket: "holobots-24046.firebasestorage.app",
  messagingSenderId: "276314676160",
  appId: "1:276314676160:web:4c564acf635324c0384625",
  measurementId: "G-X6P25GSYBT"
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Re-export Firebase Auth functions for convenience
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithCustomToken,
};

// Re-export types
export type { User };

// Helper function to call Cloud Functions
export const callFunction = <T = unknown, R = unknown>(name: string) => {
  return httpsCallable<T, R>(functions, name);
};

// Wallet verification function
export const verifyWallet = callFunction<
  { address: string; nonce: string; signature: string; type: 'evm' | 'solana' },
  { token: string; user: { wallet_address: string; provider: string } }
>('verifyWallet');

// Constants for game logic (migrated from Supabase client)
export const HOLOBOT_STATS = {
  MAX_LEVEL: 50,
  BASE_HEALTH: 100,
  BASE_ATTACK: 10,
  BASE_DEFENSE: 5,
  BASE_SPEED: 8
};

// Helper function to calculate experience needed for next level
export const calculateExperience = (level: number) => {
  const BASE_XP = 100;
  return Math.floor(BASE_XP * Math.pow(level, 2));
};

// Helper function to update holobot experience in an array
export const updateHolobotExperience = (
  holobots: any[], 
  holobotName: string, 
  newExperience: number, 
  newLevel: number
) => {
  if (!holobots || !Array.isArray(holobots)) {
    return [];
  }
  
  return holobots.map(holobot => {
    if (holobot.name.toLowerCase() === holobotName.toLowerCase()) {
      return {
        ...holobot,
        level: newLevel,
        experience: newExperience,
        nextLevelExp: calculateExperience(newLevel)
      };
    }
    return holobot;
  });
};

export default app;
