import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

// ----------------------------------------------------------------------
// SECURE ENVIRONMENT-BASED FIREBASE CONFIGURATION
// Keys are loaded from .env.local via process.env.EXPO_PUBLIC_*
// Never commit raw API keys to public repositories!
// ----------------------------------------------------------------------

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "medcompanion-66482.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "medcompanion-66482",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "medcompanion-66482.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "836610166798",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:836610166798:web:bb7326e5d5d6a0a7a42c5f"
};

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";
};

let app = null;
let db = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("🔥 Connected to Google Cloud Firestore Live Backend!");
  } else {
    console.log("⚡ Backend running in Cloud-Ready Bridge mode.");
  }
} catch (error) {
  console.log("Firebase Init Note:", error.message);
}

export { 
  app, 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy 
};
