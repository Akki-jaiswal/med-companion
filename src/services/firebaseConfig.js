import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';

// ----------------------------------------------------------------------
// 100% FREE FIREBASE SPARK CONFIGURATION
// ----------------------------------------------------------------------
// You and your partner can create a free project at https://console.firebase.google.com
// Paste your credentials below when ready. The app will work seamlessly
// with local cache until you paste the cloud credentials!
// ----------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "medcompanion-app.firebaseapp.com",
  projectId: "medcompanion-app",
  storageBucket: "medcompanion-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Check if credentials are placeholders or real
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
};

let app;
let db;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("🔥 Firebase Cloud Firestore Connected Successfully!");
  } else {
    console.log("⚡ Running in Local-Sync Mode (Ready for Firebase Cloud keys anytime)");
  }
} catch (error) {
  console.log("Firebase init note:", error.message);
}

export { db };
