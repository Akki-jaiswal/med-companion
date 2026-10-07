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
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

// ----------------------------------------------------------------------
// 100% FREE FIREBASE SPARK TIER CONFIGURATION
// ----------------------------------------------------------------------
// When you and your friend create a project at https://console.firebase.google.com,
// paste your credentials below. Until then, our Smart Cloud Sync Bridge
// simulates real-time cloud sync so your app never crashes!
// ----------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "medcompanion-dev.firebaseapp.com",
  projectId: "medcompanion-dev",
  storageBucket: "medcompanion-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";
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
  query, 
  where, 
  orderBy 
};
