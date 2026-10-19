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
  // Current Logged-in User Profile (Dynamic, starts as null until user registers or logs in)
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('PATIENT');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [caretakerPhone, setCaretakerPhone] = useState('');

  // 100% Dynamic Patients list (Starts completely empty)
  const [patients, setPatients] = useState([]);

  // 100% Dynamic Medications list (Starts completely empty)
  const [medications, setMedications] = useState([]);

  // 100% Dynamic Adherence History (Starts completely empty)
  const [adherenceHistory, setAdherenceHistory] = useState([]);

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
          setUserRole(userObj.primaryRole || (Array.isArray(userObj.roles) ? userObj.roles[0] : userObj.role) || 'PATIENT');
          if (userObj.emergencyCaretakerPhone) {
            setCaretakerPhone(userObj.emergencyCaretakerPhone);
          }
        } else {
          // No user logged in - start cleanly with null
          setCurrentUser(null);
        }

        const savedMeds = await AsyncStorage.getItem('@medications');
        if (savedMeds) setMedications(JSON.parse(savedMeds));

        const savedPatients = await AsyncStorage.getItem('@patients');
        if (savedPatients) {
          const parsed = JSON.parse(savedPatients);
          setPatients(parsed);
          if (parsed.length > 0) setSelectedPatientId(parsed[0].id);
        }

        const savedHistory = await AsyncStorage.getItem('@adherence_history');
        if (savedHistory) setAdherenceHistory(JSON.parse(savedHistory));
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
    if (!selectedPatientId) return;

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

  // Register New User (Dynamic Name, Dynamic Roles: Patient, Caretaker, or Both)
  const registerUser = async (userData) => {
    const roles = Array.isArray(userData.roles) && userData.roles.length > 0
      ? userData.roles
      : [userData.role || 'PATIENT'];

    const isPatient = roles.includes('PATIENT');
    const isCaretaker = roles.includes('CARETAKER');

    // Dynamic random pairing code if Patient
    const pairingCode = isPatient ? 'MED-' + Math.floor(1000 + Math.random() * 9000) : null;
    const initialPrimaryRole = isPatient ? 'PATIENT' : 'CARETAKER';

    const newUser = {
      id: 'u_' + Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone ? userData.phone.trim() : '',
      roles: roles,
      primaryRole: initialPrimaryRole,
      pairingCode: pairingCode,
      emergencyCaretakerPhone: userData.emergencyCaretakerPhone ? userData.emergencyCaretakerPhone.trim() : '',
      age: userData.age ? parseInt(userData.age, 10) : null,
      relation: userData.relation ? userData.relation.trim() : '',
      isAuthenticated: true,
      registeredAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setUserRole(initialPrimaryRole);
    if (newUser.emergencyCaretakerPhone) {
      setCaretakerPhone(newUser.emergencyCaretakerPhone);
    }

    await AsyncStorage.setItem('@med_user', JSON.stringify(newUser));

    // If patient mode was selected, initialize patient entry
    if (isPatient) {
      const patientSelf = {
        id: newUser.id,
        name: newUser.name,
        age: newUser.age || 65,
        code: pairingCode,
        phone: newUser.phone,
        emergencyPhone: newUser.emergencyCaretakerPhone,
        relation: 'Self',
      };
      setPatients([patientSelf]);
      setSelectedPatientId(newUser.id);
      await AsyncStorage.setItem('@patients', JSON.stringify([patientSelf]));
    } else {
      setPatients([]);
      setSelectedPatientId(null);
    }

    // If caretaker mode provided a patient code to link right away:
    if (isCaretaker && userData.patientCodeToLink) {
      await pairPatientByCode(userData.patientCodeToLink.trim().toUpperCase(), 'Monitored Patient');
    }
  };

  const loginUser = async (email, password) => {
    const savedUserStr = await AsyncStorage.getItem('@med_user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser.email?.toLowerCase() === email.trim().toLowerCase()) {
        savedUser.isAuthenticated = true;
        setCurrentUser(savedUser);
        const role = savedUser.primaryRole || (Array.isArray(savedUser.roles) ? savedUser.roles[0] : 'PATIENT');
        setUserRole(role);
        if (savedUser.emergencyCaretakerPhone) {
          setCaretakerPhone(savedUser.emergencyCaretakerPhone);
        }
        await AsyncStorage.setItem('@med_user', JSON.stringify(savedUser));
        return true;
      }
    }

    // If logging in for the first time
    const fallbackUser = {
      id: 'u_' + Date.now(),
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: '',
      roles: ['PATIENT'],
      primaryRole: 'PATIENT',
      pairingCode: 'MED-' + Math.floor(1000 + Math.random() * 9000),
      emergencyCaretakerPhone: '',
      isAuthenticated: true,
    };
    setCurrentUser(fallbackUser);
    setUserRole('PATIENT');
    await AsyncStorage.setItem('@med_user', JSON.stringify(fallbackUser));
    return true;
  };

  const logoutUser = async () => {
    setCurrentUser(null);
    setUserRole('PATIENT');
    setMedications([]);
    setPatients([]);
    setSelectedPatientId(null);
    setAdherenceHistory([]);
    setActiveAlarmMed(null);
    setEscalationAlert(null);
    await AsyncStorage.removeItem('@med_user');
    await AsyncStorage.removeItem('@medications');
    await AsyncStorage.removeItem('@patients');
    await AsyncStorage.removeItem('@adherence_history');
  };

  const switchUserRole = (newRole) => {
    setUserRole(newRole);
    setCurrentUser(prev => prev ? ({ ...prev, primaryRole: newRole }) : null);
  };

  const handleSetRole = (role) => {
    setUserRole(role);
    setCurrentUser(prev => prev ? ({ ...prev, primaryRole: role }) : null);
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
        age: 65,
        code: code.toUpperCase(),
        phone: '',
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
        switchUserRole,
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
