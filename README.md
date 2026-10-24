# 🏥 MedCompanion: Dual-Mode Medical Adherence & Escalation Mobile App
**Mobile Application Development (MAD) Lab Semester Project**

MedCompanion is a smart mobile application designed to bridge the gap between elderly patients and their family caretakers. It ensures strict medication compliance through scheduled reminders and an automated escalation alert system.

---

## 🌟 Key Features

1. **Dual Operating Modes**:
   - **Patient Mode**: High-contrast, large-font interface designed specifically for elderly individuals. Displays today's schedule, dynamic vertical alarm wheel drum, pill color/shape tags, and dietary conditions (*"After Lunch"*).
   - **Caretaker Mode**: Centralized dashboard to monitor multiple patients, remotely assign medications, track weekly compliance, and initiate instant phone calls.

2. **Automated Escalation System**:
   - When a medication time arrives, a **Full-Screen Alarm** triggers on the patient's phone with speech voice synthesis and pulsing alerts.
   - If the patient does not acknowledge ("Taken") or snooze within the threshold, an **Escalation Notification** alerts the Caretaker: *"Akki did not take Disprin scheduled at 07:56 PM. Action required!"*

3. **Emergency SOS (1-Tap Native Dial)**:
   - Giant red SOS button that immediately triggers the phone's native dialer to connect to the family caretaker. Zero external paid API costs.

4. **Doctor-Ready Downloadable PDF Report**:
   - Generates an official 7-day adherence report with compliance percentages, missed/taken breakdowns, and prescription logs. Can be shared directly to WhatsApp or saved to files.

5. **Local-First & Cloud Firestore Real-Time Backend**:
   - Prescriptions and adherence logs persist locally via `AsyncStorage` and sync bidirectionally via Google Cloud Firestore with strict multi-account isolation.

6. **Hardened Notification Pipeline (Expo Go SDK 53 Compatible)**:
   - Built with dedicated submodule decoupling to prevent native push topic crashes while providing rock-solid local notifications, alarm channels, and background triggers.

---

## 🤫 Secret Cheat Sheet: React Concepts Made Simple

If anyone asks how the code works, here are the exact concepts to mention:

1. **Components (`PatientHomeScreen.js`, `AlarmModal.js`)**:
   - Think of them as independent LEGO blocks. Each screen or modal is its own component with its own UI and logic.
2. **`useState` Hook**:
   - The app's temporary memory. For example: `const [userRole, setUserRole] = useState('PATIENT');` keeps track of whether the user is in Patient or Caretaker mode.
3. **`useEffect` Hook**:
   - A watcher that runs code when a component loads or when certain state changes (e.g., loading saved prescriptions from storage on startup).
4. **`AppContext` (`createContext`, `useContext`)**:
   - Our "Global State". Instead of passing patient data through 10 files, any screen can say `const { medications, markAsTaken } = useApp();` and instantly access everything.
5. **Flexbox Styling**:
   - React Native uses Flexbox for layout (`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`). It automatically adjusts to any phone screen size!

---

## 📱 How to Run & Preview Live on Your Phone (Expo Go)

### Step 1: Open Terminal in this folder
```bash
cd "C:\Users\Akshay Jaiswal\.gemini\antigravity\scratch\medical-companion"
```

### Step 2: Install dependencies (one-time setup)
```bash
npm install
```

### Step 3: Start Expo Server
```bash
npx expo start
```

### Step 4: Live Preview on Your Real Phone!
1. Download the free **Expo Go** app from Google Play Store (Android) or App Store (iOS).
2. Scan the **QR Code** displayed in your terminal with your phone camera or the Expo Go app.
3. The app will build and open directly on your phone with live reload enabled!
