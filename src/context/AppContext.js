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
  findPatientByCodeInCloud,
  saveUserToCloud,
  findUserInCloud
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
        // 1. Check if an active session exists
        const activeEmail = await AsyncStorage.getItem('@active_user_session');
        let userToLoad = null;

        if (activeEmail) {
          // Look up user from persistent registered users map
          const mapStr = await AsyncStorage.getItem('@registered_users_map');
          if (mapStr) {
            const usersMap = JSON.parse(mapStr);
            userToLoad = usersMap[activeEmail.toLowerCase()];
          }
        }

        // Fallback to legacy @med_user if active session not yet migrated
        if (!userToLoad) {
          const savedLegacy = await AsyncStorage.getItem('@med_user');
          if (savedLegacy) {
            userToLoad = JSON.parse(savedLegacy);
          }
        }

        if (userToLoad && userToLoad.isAuthenticated) {
          setCurrentUser(userToLoad);
          const targetRole = userToLoad.primaryRole || (Array.isArray(userToLoad.roles) ? userToLoad.roles[0] : 'PATIENT');
          setUserRole(targetRole);
          if (userToLoad.emergencyCaretakerPhone) {
            setCaretakerPhone(userToLoad.emergencyCaretakerPhone);
          }

          // Load user-scoped patients
          const savedPatients = await AsyncStorage.getItem(`@patients_${userToLoad.id}`) || await AsyncStorage.getItem('@patients');
          if (savedPatients) {
            const parsed = JSON.parse(savedPatients);
            setPatients(parsed);
            if (parsed.length > 0) setSelectedPatientId(parsed[0].id);
          }

          // Load user-scoped medications
          const savedMeds = await AsyncStorage.getItem(`@medications_${userToLoad.id}`) || await AsyncStorage.getItem('@medications');
          if (savedMeds) setMedications(JSON.parse(savedMeds));
        } else {
          // No user is logged in
          setCurrentUser(null);
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
      if (currentUser?.id) {
        await AsyncStorage.setItem(`@medications_${currentUser.id}`, JSON.stringify(updatedMeds));
      }
    } catch (e) {
      console.log('Error saving storage', e);
    }
  };

  // Register New User (Dynamic Name, Dynamic Roles: Patient, Caretaker, or Both)
  const registerUser = async (userData) => {
    const emailKey = userData.email.trim().toLowerCase();
    const roles = Array.isArray(userData.roles) && userData.roles.length > 0
      ? userData.roles
      : [userData.role || 'PATIENT'];

    const isPatient = roles.includes('PATIENT');
    const isCaretaker = roles.includes('CARETAKER');

    // If user registered as only Caretaker, start in CARETAKER mode!
    // If user registered as only Patient or Both, start in PATIENT mode!
    const initialPrimaryRole = isCaretaker && !isPatient ? 'CARETAKER' : 'PATIENT';
    const pairingCode = isPatient ? 'MED-' + Math.floor(1000 + Math.random() * 9000) : null;

    const newUser = {
      id: 'u_' + Date.now(),
      name: userData.name.trim(),
      email: emailKey,
      password: userData.password,
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

    // Set in-memory active states
    setCurrentUser(newUser);
    setUserRole(initialPrimaryRole);
    if (newUser.emergencyCaretakerPhone) {
      setCaretakerPhone(newUser.emergencyCaretakerPhone);
    }

    // 1. Permanently store in Registered Users Map
    let usersMap = {};
    try {
      const existingMapStr = await AsyncStorage.getItem('@registered_users_map');
      if (existingMapStr) usersMap = JSON.parse(existingMapStr);
    } catch (e) {}
    usersMap[emailKey] = newUser;
    await AsyncStorage.setItem('@registered_users_map', JSON.stringify(usersMap));

    // 2. Persist active user session
    await AsyncStorage.setItem('@active_user_session', emailKey);
    await AsyncStorage.setItem('@med_user', JSON.stringify(newUser));

    // 3. Save to Cloud Firestore
    await saveUserToCloud(newUser);

    // 4. If patient mode was selected, initialize patient entry
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
      await AsyncStorage.setItem(`@patients_${newUser.id}`, JSON.stringify([patientSelf]));
      await AsyncStorage.setItem('@patients', JSON.stringify([patientSelf]));
    } else {
      setPatients([]);
      setSelectedPatientId(null);
      await AsyncStorage.setItem(`@patients_${newUser.id}`, JSON.stringify([]));
      await AsyncStorage.setItem('@patients', JSON.stringify([]));
    }

    // 5. If caretaker mode provided a patient code to link right away:
    if (isCaretaker && userData.patientCodeToLink) {
      await pairPatientByCode(userData.patientCodeToLink.trim().toUpperCase(), 'Monitored Patient');
    }

    return { success: true, user: newUser };
  };

  // Login Existing User with Exact Profile and Correct Role
  const loginUser = async (email, password) => {
    const emailKey = email.trim().toLowerCase();

    // 1. Check local registered users map
    let usersMap = {};
    try {
      const mapStr = await AsyncStorage.getItem('@registered_users_map');
      if (mapStr) usersMap = JSON.parse(mapStr);
    } catch (e) {}

    let foundUser = usersMap[emailKey];

    // 2. Check Cloud Firestore if not found locally
    if (!foundUser) {
      const cloudUser = await findUserInCloud(emailKey);
      if (cloudUser) {
        foundUser = cloudUser;
        usersMap[emailKey] = cloudUser;
        await AsyncStorage.setItem('@registered_users_map', JSON.stringify(usersMap));
      }
    }

    // 3. Check legacy @med_user
    if (!foundUser) {
      try {
        const legacyStr = await AsyncStorage.getItem('@med_user');
        if (legacyStr) {
          const legacy = JSON.parse(legacyStr);
          if (legacy.email?.toLowerCase() === emailKey) {
            foundUser = legacy;
            usersMap[emailKey] = legacy;
            await AsyncStorage.setItem('@registered_users_map', JSON.stringify(usersMap));
          }
        }
      } catch (e) {}
    }

    // 4. If account does NOT exist, fail gracefully with an explicit message
    if (!foundUser) {
      return {
        success: false,
        error: `No account found with email "${email}". Please verify your email or click "Create Account" to register.`
      };
    }

    // 5. Verify password
    if (foundUser.password && foundUser.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please enter the correct password.'
      };
    }

    // 6. Restore real account state
    foundUser.isAuthenticated = true;
    const targetRole = foundUser.primaryRole || (Array.isArray(foundUser.roles) ? foundUser.roles[0] : 'PATIENT');
    
    setCurrentUser(foundUser);
    setUserRole(targetRole);

    if (foundUser.emergencyCaretakerPhone) {
      setCaretakerPhone(foundUser.emergencyCaretakerPhone);
    }

    // 7. Load user-specific patients & medications
    try {
      const userPatientsStr = await AsyncStorage.getItem(`@patients_${foundUser.id}`);
      if (userPatientsStr) {
        const parsed = JSON.parse(userPatientsStr);
        setPatients(parsed);
        if (parsed.length > 0) setSelectedPatientId(parsed[0].id);
      } else if (foundUser.roles?.includes('PATIENT')) {
        const patientSelf = {
          id: foundUser.id,
          name: foundUser.name,
          age: foundUser.age || 65,
          code: foundUser.pairingCode,
          phone: foundUser.phone,
          emergencyPhone: foundUser.emergencyCaretakerPhone,
          relation: 'Self',
        };
        setPatients([patientSelf]);
        setSelectedPatientId(foundUser.id);
      } else {
        setPatients([]);
        setSelectedPatientId(null);
      }

      const userMedsStr = await AsyncStorage.getItem(`@medications_${foundUser.id}`);
      if (userMedsStr) {
        setMedications(JSON.parse(userMedsStr));
      } else {
        setMedications([]);
      }
    } catch (e) {
      console.log('Error loading user-scoped data:', e);
    }

    // 8. Persist active session
    await AsyncStorage.setItem('@active_user_session', emailKey);
    await AsyncStorage.setItem('@med_user', JSON.stringify(foundUser));

    return { success: true, user: foundUser };
  };

  const logoutUser = async () => {
    // Persist current medications & patients under current user's id before clearing
    if (currentUser?.id) {
      try {
        await AsyncStorage.setItem(`@medications_${currentUser.id}`, JSON.stringify(medications));
        await AsyncStorage.setItem(`@patients_${currentUser.id}`, JSON.stringify(patients));
      } catch (e) {}
    }

    // Clear active session
    setCurrentUser(null);
    setUserRole('PATIENT');
    setMedications([]);
    setPatients([]);
    setSelectedPatientId(null);
    setAdherenceHistory([]);
    setActiveAlarmMed(null);
    setEscalationAlert(null);

    // Remove active session key only (Preserves registered user accounts in @registered_users_map!)
    await AsyncStorage.removeItem('@active_user_session');
    await AsyncStorage.removeItem('@med_user');
  };

  const switchUserRole = async (newRole) => {
    setUserRole(newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, primaryRole: newRole };
      setCurrentUser(updatedUser);
      // Update in registered users map and active session
      try {
        const mapStr = await AsyncStorage.getItem('@registered_users_map');
        if (mapStr) {
          const map = JSON.parse(mapStr);
          map[updatedUser.email.toLowerCase()] = updatedUser;
          await AsyncStorage.setItem('@registered_users_map', JSON.stringify(map));
        }
        await AsyncStorage.setItem('@med_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  const handleSetRole = (role) => {
    switchUserRole(role);
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
