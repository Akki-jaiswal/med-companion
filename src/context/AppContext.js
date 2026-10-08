import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerForPushNotificationsAsync, 
  scheduleMedicationAlarm, 
  fireInstantMedicationNotification,
  scheduleCaretakerEscalationNotification,
  cancelScheduledNotification,
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
    return createdAt + 60 * 1000;
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

    return target.getTime();
  } catch (e) {
    return Date.now() + 60000;
  }
};

export const AppProvider = ({ children }) => {
  // Current Logged-in User Profile (Dynamic, starts with active user or null)
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('PATIENT');
  const [selectedPatientId, setSelectedPatientId] = useState('p1');
  const [caretakerPhone, setCaretakerPhone] = useState('+919876543210');

  // Dynamic Patients list
  const [patients, setPatients] = useState([
    {
      id: 'p1',
      name: 'My Patient',
      age: 68,
      code: 'MED-7821',
      phone: '+919876543210',
      relation: 'Family Member',
    }
  ]);

  // Dynamic Medications list
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
      targetTimestamp: Date.now() + 50 * 1000, // Rings automatically 50s from app launch
      mealCondition: 'After Lunch',
      color: '#EF4444',
      shape: 'capsule',
      statusToday: 'pending',
      takenAt: null,
    }
  ]);

  const [adherenceHistory, setAdherenceHistory] = useState([
    { date: new Date().toISOString().split('T')[0], pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true }
  ]);

  const [activeAlarmMed, setActiveAlarmMed] = useState(null);
  const [escalationAlert, setEscalationAlert] = useState(null);

  // Track fired alarms so each alarm only rings once per scheduled time
  const firedAlarmIdsRef = useRef(new Set());
  const pendingEscalationsRef = useRef({});

  // Check pending alarms when app resumes from background or on clock tick
  const checkPendingAlarms = async () => {
    const now = Date.now();
    for (const med of medications) {
      if (med.statusToday === 'pending' && med.targetTimestamp) {
        // Case A: User was away from app and >60s passed since scheduled time without acknowledgement
        if (now >= med.targetTimestamp + 60000 && !firedAlarmIdsRef.current.has(med.id)) {
          firedAlarmIdsRef.current.add(med.id);
          triggerMissedEscalation(med);
        }
        // Case B: Alarm time has arrived (within current 60s active countdown window)
        else if (now >= med.targetTimestamp && !firedAlarmIdsRef.current.has(med.id)) {
          firedAlarmIdsRef.current.add(med.id);
          setActiveAlarmMed(med);
          fireInstantMedicationNotification(med);

          // Schedule background OS notification for Caretaker in 60s in case user minimizes app
          const patientName = currentUser?.name || 'Patient';
          const notifId = await scheduleCaretakerEscalationNotification(
            patientName,
            med.name,
            med.time,
            60
          );
          if (notifId) {
            pendingEscalationsRef.current[med.id] = notifId;
          }
        }
      }
    }
  };

  // AppState listener: catches alarms when user switches back from home screen / background!
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPendingAlarms();
      }
    });

    return () => subscription.remove();
  }, [medications]);

  // Request system notification permissions & load storage on launch
  useEffect(() => {
    registerForPushNotificationsAsync();

    const loadSavedData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('@med_user');
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          setCurrentUser(userObj);
          setUserRole(userObj.role);
        } else {
          // Default initial profile if user hasn't registered yet
          const defaultUser = {
            id: 'u_default',
            name: 'Patient User',
            email: 'user@medcompanion.com',
            role: 'PATIENT',
            phone: '+919876543210',
            pairingCode: 'MED-7821',
            isAuthenticated: true,
          };
          setCurrentUser(defaultUser);
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

  // Real-Time Clock Engine: Runs every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      checkPendingAlarms();
    }, 1500);

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

  // Register New User (Dynamic Name & Code)
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
    setCurrentUser(null);
    await AsyncStorage.removeItem('@med_user');
  };

  const handleSetRole = (role) => {
    setUserRole(role);
    setCurrentUser(prev => prev ? ({ ...prev, role }) : null);
  };

  // Mark medicine as Taken
  const markAsTaken = async (medId) => {
    // Cancel the pending Caretaker Escalation notification because user took the pill!
    const pendingNotifId = pendingEscalationsRef.current[medId];
    if (pendingNotifId) {
      cancelScheduledNotification(pendingNotifId);
      delete pendingEscalationsRef.current[medId];
    }

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
    // Cancel any scheduled escalation for this round
    const pendingNotifId = pendingEscalationsRef.current[medId];
    if (pendingNotifId) {
      cancelScheduledNotification(pendingNotifId);
      delete pendingEscalationsRef.current[medId];
    }

    setActiveAlarmMed(null);
    const newTarget = Date.now() + 60 * 1000;
    firedAlarmIdsRef.current.delete(medId);

    const updated = medications.map(m => m.id === medId ? { ...m, targetTimestamp: newTarget } : m);
    saveMedications(updated);

    scheduleMedicationAlarm(activeAlarmMed, 60);
    alert('Alarm snoozed! Will automatically ring again in 1 minute.');
  };

  // Trigger Missed Escalation -> FIRES REAL ANDROID NOTIFICATION TRAY ALERT!
  const triggerMissedEscalation = async (med) => {
    const pendingNotifId = pendingEscalationsRef.current[med.id];
    if (pendingNotifId) {
      delete pendingEscalationsRef.current[med.id];
    }

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
      patientName: currentUser?.name || 'Patient',
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

    firedAlarmIdsRef.current.delete(item.id);

    saveMedications([...medications, item]);
    await addMedicationToCloud(item);

    const delay = Math.max(1, Math.round((targetTimestamp - now) / 1000));
    scheduleMedicationAlarm(item, delay);

    // Also schedule Caretaker background escalation notification at delay + 60s
    const patientName = currentUser?.name || 'Patient';
    const escId = await scheduleCaretakerEscalationNotification(
      patientName,
      item.name,
      item.time,
      delay + 60
    );
    if (escId) {
      pendingEscalationsRef.current[item.id] = escId;
    }
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
