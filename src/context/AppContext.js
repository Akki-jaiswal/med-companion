import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerForPushNotificationsAsync, 
  scheduleMedicationAlarm, 
  fireInstantMedicationNotification,
  triggerCaretakerPushAlert 
} from '../services/notificationService';
import {
  subscribeToPatientMedications,
  updateMedicationStatusInCloud,
  addMedicationToCloud,
  subscribeToEscalationAlerts,
  triggerCloudEscalation,
  findPatientByCodeInCloud
} from '../services/firestoreService';

const AppContext = createContext();

// Helper to convert time strings (e.g. "08:00 AM", "01:30 PM", "In 1 Minute") to target timestamp
const parseTimeToTimestamp = (timeStr, createdAt = Date.now()) => {
  if (!timeStr) return Date.now() + 60000;

  if (timeStr.toLowerCase().includes('1 min') || timeStr.toLowerCase().includes('in 1 minute')) {
    return createdAt + 60 * 1000; // Exactly 60 seconds from creation!
  }

  try {
    const parts = timeStr.trim().split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const modifier = parts[1] ? parts[1].toUpperCase() : 'AM';

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If time already passed earlier today, set for demo test in 1 min or keep
    return target.getTime();
  } catch (e) {
    return Date.now() + 60000;
  }
};

export const AppProvider = ({ children }) => {
  // Current Logged-in User Profile
  const [currentUser, setCurrentUser] = useState({
    id: 'u1',
    name: 'Akshay Jaiswal',
    email: 'akshay@medcompanion.com',
    role: 'PATIENT',
    phone: '+919876543210',
    pairingCode: 'MED-7821',
    isAuthenticated: true,
  });

  const [userRole, setUserRole] = useState('PATIENT');
  const [selectedPatientId, setSelectedPatientId] = useState('p1');
  const [caretakerPhone, setCaretakerPhone] = useState('+919876543210');

  // Patients list
  const [patients, setPatients] = useState([
    {
      id: 'p1',
      name: 'Dad (Robert)',
      age: 68,
      code: 'MED-7821',
      phone: '+919876543210',
      relation: 'Father',
    },
    {
      id: 'p2',
      name: 'Grandma (Mary)',
      age: 82,
      code: 'MED-4390',
      phone: '+919812345678',
      relation: 'Grandmother',
    }
  ]);

  // Initial Seed Medications with realistic timestamps
  const [medications, setMedications] = useState([
    {
      id: 'm1',
      patientId: 'p1',
      name: 'Amlodipine (Blood Pressure)',
      dosage: '5 mg - 1 Tablet',
      time: '08:00 AM',
      targetTimestamp: parseTimeToTimestamp('08:00 AM'),
      mealCondition: 'After Breakfast',
      color: '#3B82F6',
      shape: 'circle',
      statusToday: 'taken',
      takenAt: '08:05 AM',
    },
    {
      id: 'm2',
      patientId: 'p1',
      name: 'Metformin (Sugar)',
      dosage: '500 mg - 1 Tablet',
      time: 'In 1 Minute',
      targetTimestamp: Date.now() + 45 * 1000, // Will ring automatically in 45 seconds!
      mealCondition: 'After Lunch',
      color: '#EF4444',
      shape: 'capsule',
      statusToday: 'pending',
      takenAt: null,
    },
    {
      id: 'm3',
      patientId: 'p1',
      name: 'Atorvastatin (Cholesterol)',
      dosage: '10 mg - 1 Tablet',
      time: '08:30 PM',
      targetTimestamp: parseTimeToTimestamp('08:30 PM'),
      mealCondition: 'After Dinner',
      color: '#10B981',
      shape: 'square',
      statusToday: 'pending',
      takenAt: null,
    }
  ]);

  const [adherenceHistory, setAdherenceHistory] = useState([
    { date: '2026-10-07', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
    { date: '2026-10-06', pillName: 'Metformin', time: '01:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-06', pillName: 'Atorvastatin', time: '08:30 PM', status: 'Missed', onTime: false },
  ]);

  const [activeAlarmMed, setActiveAlarmMed] = useState(null);
  const [escalationAlert, setEscalationAlert] = useState(null);

  // Track which alarms have already fired automatically so they don't loop
  const firedAlarmIdsRef = useRef(new Set());

  // Request system notification permissions on app launch
  useEffect(() => {
    registerForPushNotificationsAsync();

    const loadSavedData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('@med_user');
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          setCurrentUser(userObj);
          setUserRole(userObj.role);
        }

        const savedMeds = await AsyncStorage.getItem('@medications');
        if (savedMeds) setMedications(JSON.parse(savedMeds));

        const savedPatients = await AsyncStorage.getItem('@patients');
        if (savedPatients) setPatients(JSON.parse(savedPatients));
      } catch (e) {
        console.log('Error reading storage', e);
      }
    };
    loadSavedData();
  }, []);

  // -------------------------------------------------------------
  // AUTOMATED REAL-TIME CLOCK ENGINE (NO MANUAL CLICKS NEEDED!)
  // Checks every second if any medicine's time has arrived
  // -------------------------------------------------------------
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = Date.now();

      medications.forEach((med) => {
        // If medicine is pending, has a target timestamp, and time has arrived
        if (
          med.statusToday === 'pending' &&
          med.targetTimestamp &&
          now >= med.targetTimestamp &&
          !firedAlarmIdsRef.current.has(med.id)
        ) {
          console.log(`⏰ [ALARM AUTO-FIRED] Time reached for: ${med.name}`);
          
          // Mark as fired so it doesn't repeatedly trigger
          firedAlarmIdsRef.current.add(med.id);

          // 1. AUTOMATICALLY POP UP THE FULL SCREEN ALARM
          setActiveAlarmMed(med);

          // 2. AUTOMATICALLY TRIGGER ANDROID SYSTEM NOTIFICATION
          fireInstantMedicationNotification(med);
        }
      });
    }, 1500); // Check every 1.5 seconds

    return () => clearInterval(clockInterval);
  }, [medications]);

  // Real-Time Cloud Listeners (Subscribes to Firestore when connected)
  useEffect(() => {
    const unsubscribeMeds = subscribeToPatientMedications(selectedPatientId, (cloudMeds) => {
      if (cloudMeds && cloudMeds.length > 0) {
        setMedications(cloudMeds);
      }
    });

    const unsubscribeEscalations = subscribeToEscalationAlerts(selectedPatientId, (cloudAlert) => {
      if (cloudAlert) {
        setEscalationAlert(cloudAlert);
      }
    });

    return () => {
      unsubscribeMeds();
      unsubscribeEscalations();
    };
  }, [selectedPatientId]);

  const saveMedications = async (updatedMeds) => {
    setMedications(updatedMeds);
    try {
      await AsyncStorage.setItem('@medications', JSON.stringify(updatedMeds));
    } catch (e) {
      console.log('Error saving storage', e);
    }
  };

  const registerUser = async (userData) => {
    const code = userData.role === 'PATIENT' ? 'MED-' + Math.floor(1000 + Math.random() * 9000) : null;
    const newUser = {
      ...userData,
      id: 'u_' + Date.now(),
      pairingCode: code,
      isAuthenticated: true,
    };

    setCurrentUser(newUser);
    setUserRole(newUser.role);
    await AsyncStorage.setItem('@med_user', JSON.stringify(newUser));

    if (userData.patientCodeToLink) {
      pairPatientByCode(userData.patientCodeToLink, 'Monitored Patient');
    }
  };

  const loginUser = async (email, password) => {
    const userObj = {
      ...currentUser,
      email,
      isAuthenticated: true,
    };
    setCurrentUser(userObj);
    await AsyncStorage.setItem('@med_user', JSON.stringify(userObj));
    return true;
  };

  const logoutUser = async () => {
    const loggedOut = { ...currentUser, isAuthenticated: false };
    setCurrentUser(loggedOut);
    await AsyncStorage.removeItem('@med_user');
  };

  const handleSetRole = (role) => {
    setUserRole(role);
    setCurrentUser(prev => ({ ...prev, role }));
  };

  // Mark medicine as Taken
  const markAsTaken = async (medId) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    const updated = medications.map(m => {
      if (m.id === medId) {
        setAdherenceHistory(prev => [
          { date: todayStr, pillName: m.name, time: m.time, status: 'Taken', onTime: true },
          ...prev
        ]);
        return { ...m, statusToday: 'taken', takenAt: timeStr };
      }
      return m;
    });

    saveMedications(updated);
    setActiveAlarmMed(null);

    await updateMedicationStatusInCloud(medId, 'taken', timeStr);
  };

  // Patient snoozes alarm
  const snoozeAlarm = (medId) => {
    setActiveAlarmMed(null);
    // Automatically reschedule to ring again in 10 minutes (or 60s for demo)
    const newTarget = Date.now() + 60 * 1000;
    firedAlarmIdsRef.current.delete(medId);

    const updated = medications.map(m => m.id === medId ? { ...m, targetTimestamp: newTarget } : m);
    saveMedications(updated);

    scheduleMedicationAlarm(activeAlarmMed, 60);
    alert('Alarm snoozed! Will automatically ring again in 1 minute.');
  };

  // Trigger Missed Escalation -> FIRES REAL ANDROID NOTIFICATION TRAY ALERT!
  const triggerMissedEscalation = async (med) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = medications.map(m => m.id === med.id ? { ...m, statusToday: 'missed' } : m);
    saveMedications(updated);

    setAdherenceHistory(prev => [
      { date: todayStr, pillName: med.name, time: med.time, status: 'Missed', onTime: false },
      ...prev
    ]);

    setActiveAlarmMed(null);

    const alertPayload = {
      patientId: selectedPatientId,
      patientName: currentUser?.name || 'Dad (Robert)',
      pillName: med.name,
      scheduledTime: med.time,
      timestamp: new Date().toLocaleTimeString(),
      phone: caretakerPhone,
    };

    setEscalationAlert(alertPayload);

    // 1. Sync to Cloud Firestore
    await triggerCloudEscalation(alertPayload);
    await updateMedicationStatusInCloud(med.id, 'missed');

    // 2. FIRES ACTUAL ANDROID SYSTEM NOTIFICATION DIRECTLY ON PHONE!
    await triggerCaretakerPushAlert(
      alertPayload.patientName,
      alertPayload.pillName,
      alertPayload.scheduledTime
    );
  };

  // Add new medicine (from Caretaker)
  const addMedication = async (newMed) => {
    const now = Date.now();
    const targetTimestamp = parseTimeToTimestamp(newMed.time, now);

    const item = {
      ...newMed,
      id: 'm_' + now,
      patientId: selectedPatientId,
      targetTimestamp: targetTimestamp,
      statusToday: 'pending',
      takenAt: null,
    };

    // Remove from fired list so the new schedule triggers automatically
    firedAlarmIdsRef.current.delete(item.id);

    saveMedications([...medications, item]);
    await addMedicationToCloud(item);

    // Schedule background notification
    const delay = Math.max(1, Math.round((targetTimestamp - now) / 1000));
    scheduleMedicationAlarm(item, delay);
  };

  // Add new patient
  const addPatient = async (patientData) => {
    const code = patientData.code || ('MED-' + Math.floor(1000 + Math.random() * 9000));
    const newP = {
      ...patientData,
      id: 'p_' + Date.now(),
      code: code,
    };
    const updated = [...patients, newP];
    setPatients(updated);
    setSelectedPatientId(newP.id);
    await AsyncStorage.setItem('@patients', JSON.stringify(updated));
  };

  // Pair Patient by Code
  const pairPatientByCode = async (code, fallbackName = 'Linked Patient') => {
    const cloudPatient = await findPatientByCodeInCloud(code);
    if (cloudPatient) {
      setPatients(prev => [...prev.filter(p => p.id !== cloudPatient.id), cloudPatient]);
      setSelectedPatientId(cloudPatient.id);
      return cloudPatient;
    }

    const existing = patients.find(p => p.code.toUpperCase() === code.toUpperCase());
    if (existing) {
      setSelectedPatientId(existing.id);
      return existing;
    } else {
      const newP = {
        id: 'p_' + Date.now(),
        name: fallbackName,
        age: 70,
        code: code.toUpperCase(),
        phone: '+919876543210',
        relation: 'Monitored',
      };
      setPatients(prev => [...prev, newP]);
      setSelectedPatientId(newP.id);
      return newP;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole: handleSetRole,
        loginUser,
        registerUser,
        logoutUser,
        selectedPatientId,
        setSelectedPatientId,
        patients,
        addPatient,
        pairPatientByCode,
        medications,
        addMedication,
        markAsTaken,
        snoozeAlarm,
        activeAlarmMed,
        setActiveAlarmMed,
        triggerMissedEscalation,
        escalationAlert,
        setEscalationAlert,
        adherenceHistory,
        caretakerPhone,
        setCaretakerPhone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
