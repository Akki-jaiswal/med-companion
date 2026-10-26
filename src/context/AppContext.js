import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerForPushNotificationsAsync, 
  scheduleMedicationAlarm, 
  schedulePreAlarmNotification,
  fireInstantMedicationNotification,
  scheduleCaretakerEscalationNotification,
  cancelScheduledNotification,
  triggerCaretakerPushAlert,
  addNotificationResponseListener,
  addNotificationReceivedListener
} from '../services/notificationService';
import { sendMissedMedicationSMS } from '../services/emergencyService';
import {
  subscribeToPatientMedications,
  updateMedicationStatusInCloud,
  addMedicationToCloud,
  subscribeToEscalationAlerts,
  triggerCloudEscalation,
  findPatientByCodeInCloud,
  savePatientToCloud,
  saveUserToCloud,
  findUserInCloud,
  deleteUserFromCloud,
  deletePatientCompletelyFromCloud,
  resolveCloudEscalation
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

    const target = new Date(createdAt);
    target.setHours(hours, minutes, 0, 0);

    // If scheduled time for today has already elapsed by more than 30 seconds, schedule for next occurrence (tomorrow)
    if (target.getTime() < createdAt - 30000) {
      target.setDate(target.getDate() + 1);
    }

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

  const [activeAlarmMeds, setActiveAlarmMeds] = useState([]);
  const activeAlarmMed = activeAlarmMeds.length > 0 ? activeAlarmMeds[0] : null;

  // Setter supporting backward-compatible single med calls and clearing
  const setActiveAlarmMed = (med) => {
    if (!med) {
      setActiveAlarmMeds([]);
    } else {
      setActiveAlarmMeds(Array.isArray(med) ? med : [med]);
    }
  };

  const [escalationAlert, setEscalationAlert] = useState(null);

  // Track fired alarms so each alarm only rings once per scheduled time
  const firedAlarmIdsRef = useRef(new Set());
  const pendingEscalationsRef = useRef({});

  // Check pending alarms when app resumes from background or on clock tick
  const checkPendingAlarms = async () => {
    const now = Date.now();

    const isMedScheduledToday = (med) => {
      if (!med.frequency || med.frequency === 'Daily') return true;
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayName = dayNames[new Date().getDay()];
      if (med.frequency === 'Specific Days') {
        return Array.isArray(med.selectedDays) && med.selectedDays.includes(todayName);
      }
      if (med.frequency === 'Weekly') {
        return !med.weeklyDay || med.weeklyDay === todayName;
      }
      return true;
    };

    const dueList = [];
    const missedList = [];

    for (const med of medications) {
      if (med.statusToday === 'pending' && med.targetTimestamp && isMedScheduledToday(med)) {
        // Case A: User was away from app and >60s passed since scheduled time without acknowledgement
        if (now >= med.targetTimestamp + 60000 && !firedAlarmIdsRef.current.has(med.id)) {
          firedAlarmIdsRef.current.add(med.id);
          missedList.push(med);
        }
        // Case B: Alarm time has arrived (within current 60s active countdown window)
        else if (now >= med.targetTimestamp && !firedAlarmIdsRef.current.has(med.id)) {
          firedAlarmIdsRef.current.add(med.id);
          dueList.push(med);
        }
      }
    }

    if (missedList.length > 0) {
      triggerMissedEscalation(missedList);
    }

    if (dueList.length > 0) {
      // CRITICAL: Full-screen medication alarm & TTS are strictly for PATIENTS!
      if (userRole === 'PATIENT') {
        setActiveAlarmMeds(prev => {
          const combined = [...prev, ...dueList.filter(d => !prev.some(p => p.id === d.id))];
          return combined;
        });
        fireInstantMedicationNotification(dueList);
      }

      // Schedule background OS notification for Caretaker in 60s in case patient minimizes app
      for (const med of dueList) {
        const owningPatient = patients.find(p => p.id === med.patientId);
        const resolvedPatientName = med.patientName || (userRole === 'PATIENT' ? currentUser?.name : owningPatient?.name) || 'Patient';
        const notifId = await scheduleCaretakerEscalationNotification(
          resolvedPatientName,
          med.name,
          med.time,
          60
        );
        if (notifId) {
          pendingEscalationsRef.current[med.id] = notifId;
        }
      }
    }
  };

  // AppState & Android System Notification Tray Listener: catches alarms when user switches back or taps tray notification
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPendingAlarms();
      }
    });

    // When patient taps on the urgent notification in phone status bar, instantly display AlarmModal
    const responseSub = typeof addNotificationResponseListener === 'function'
      ? addNotificationResponseListener((response) => {
          const data = response?.notification?.request?.content?.data;
          if (data?.medIds && Array.isArray(data.medIds) && userRole === 'PATIENT') {
            const matched = medications.filter(m => data.medIds.includes(m.id));
            if (matched.length > 0) {
              setActiveAlarmMeds(matched);
            } else {
              checkPendingAlarms();
            }
          } else {
            checkPendingAlarms();
          }
        })
      : { remove: () => {} };

    const receivedSub = typeof addNotificationReceivedListener === 'function'
      ? addNotificationReceivedListener((notification) => {
          const data = notification?.request?.content?.data;
          if (data?.type === 'medication_alarm' && userRole === 'PATIENT') {
            checkPendingAlarms();
          }
        })
      : { remove: () => {} };

    return () => {
      subscription.remove();
      if (responseSub?.remove) responseSub.remove();
      if (receivedSub?.remove) receivedSub.remove();
    };
  }, [medications, userRole]);

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
          const savedPatients = await AsyncStorage.getItem(`@patients_${userToLoad.id}`);
          if (savedPatients) {
            const parsed = JSON.parse(savedPatients);
            setPatients(parsed);
            if (parsed.length > 0) setSelectedPatientId(parsed[0].id);
          } else if (userToLoad.roles?.includes('PATIENT')) {
            const pSelf = {
              id: userToLoad.id,
              name: userToLoad.name,
              age: userToLoad.age || null,
              code: userToLoad.pairingCode,
              phone: userToLoad.phone,
              emergencyPhone: userToLoad.emergencyCaretakerPhone,
              relation: 'Self',
            };
            setPatients([pSelf]);
            setSelectedPatientId(userToLoad.id);
          } else {
            setPatients([]);
            setSelectedPatientId(null);
          }

          // Load user-scoped medications (STRICTLY user-scoped, never leak from other accounts!)
          const savedMeds = await AsyncStorage.getItem(`@medications_${userToLoad.id}`);
          setMedications(savedMeds ? JSON.parse(savedMeds) : []);

          // Load user-scoped adherence history (STRICTLY user-scoped, never leak from other accounts!)
          const userHistoryStr = await AsyncStorage.getItem(`@adherence_history_${userToLoad.id}`);
          setAdherenceHistory(userHistoryStr ? JSON.parse(userHistoryStr) : []);
        } else {
          // No user is logged in
          setCurrentUser(null);
          setAdherenceHistory([]);
        }
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

  // Real-Time Cloud Listeners & Patient-Scoped Medications Loader
  useEffect(() => {
    if (!selectedPatientId) return;

    // 1. Immediately load local medications for this patient
    const loadLocalPatientMeds = async () => {
      try {
        const pMedsStr = await AsyncStorage.getItem(`@patient_medications_${selectedPatientId}`);
        if (pMedsStr) {
          const pMeds = JSON.parse(pMedsStr);
          setMedications(prev => {
            const others = prev.filter(m => m.patientId !== selectedPatientId);
            return [...others, ...pMeds];
          });
        }
      } catch (e) {}
    };
    loadLocalPatientMeds();

    // 2. Real-time Firestore sync for this patient
    const unsubscribeMeds = subscribeToPatientMedications(selectedPatientId, (cloudMeds) => {
      if (cloudMeds && cloudMeds.length > 0) {
        setMedications(prev => {
          const others = prev.filter(m => m.patientId !== selectedPatientId);
          return [...others, ...cloudMeds];
        });
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
      // Also update patient-scoped storage for each affected patient
      const patientIds = [...new Set(updatedMeds.map(m => m.patientId).filter(Boolean))];
      for (const pId of patientIds) {
        const pMeds = updatedMeds.filter(m => m.patientId === pId);
        await AsyncStorage.setItem(`@patient_medications_${pId}`, JSON.stringify(pMeds));
      }
    } catch (e) {
      console.log('Error saving storage', e);
    }
  };

  // Register New User (Dynamic Name, Dynamic Roles: Patient, Caretaker, or Both)
  const registerUser = async (userData) => {
    const emailKey = userData.email.trim().toLowerCase();

    // 0. UNIQUE EMAIL CONSTRAINT: Prevent duplicate registration with same email
    let usersMap = {};
    try {
      const existingMapStr = await AsyncStorage.getItem('@registered_users_map');
      if (existingMapStr) usersMap = JSON.parse(existingMapStr);
    } catch (e) {}

    if (usersMap[emailKey]) {
      return {
        success: false,
        error: `An account with ${emailKey} already exists. Please switch to Sign In or use another email.`,
      };
    }

    try {
      const cloudUser = await findUserInCloud(emailKey);
      if (cloudUser) {
        return {
          success: false,
          error: `An account with ${emailKey} is already registered. Please sign in instead.`,
        };
      }
    } catch (e) {}

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

    // STRICT MULTI-ACCOUNT ISOLATION:
    // Brand new registered accounts start with ZERO medications and empty adherence history!
    setMedications([]);
    setAdherenceHistory([]);
    setActiveAlarmMeds([]);
    setEscalationAlert(null);
    firedAlarmIdsRef.current.clear();
    pendingEscalationsRef.current = {};

    await AsyncStorage.setItem(`@medications_${newUser.id}`, JSON.stringify([]));
    await AsyncStorage.setItem(`@adherence_history_${newUser.id}`, JSON.stringify([]));
    await AsyncStorage.setItem('@medications', JSON.stringify([]));
    await AsyncStorage.setItem('@adherence_history', JSON.stringify([]));

    // 1. Permanently store in Registered Users Map
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
        age: newUser.age ? Number(newUser.age) : null,
        code: pairingCode,
        phone: newUser.phone,
        emergencyPhone: newUser.emergencyCaretakerPhone,
        relation: 'Self',
      };
      setPatients([patientSelf]);
      setSelectedPatientId(newUser.id);
      await AsyncStorage.setItem(`@patients_${newUser.id}`, JSON.stringify([patientSelf]));
      await AsyncStorage.setItem('@patients', JSON.stringify([patientSelf]));
      await savePatientToCloud(patientSelf);
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
          age: foundUser.age ? Number(foundUser.age) : null,
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

      // Load user-specific adherence history
      const userHistoryStr = await AsyncStorage.getItem(`@adherence_history_${foundUser.id}`);
      if (userHistoryStr) {
        setAdherenceHistory(JSON.parse(userHistoryStr));
      } else {
        setAdherenceHistory([]);
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
        await AsyncStorage.setItem(`@adherence_history_${currentUser.id}`, JSON.stringify(adherenceHistory));
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

  // Mark medicine as Taken (Converts any previously missed status to Taken so reports remain 100% accurate!)
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

    let targetOwner = currentUser?.id || 'self';

    const updated = medications.map(m => {
      if (m.id === medId) {
        const targetOwnerId = m.patientId || currentUser?.id || 'self';
        targetOwner = targetOwnerId;

        setAdherenceHistory(prev => {
          let convertedMissed = false;
          // Look for any existing 'Missed' record for this medicine today
          const nextHist = prev.map(rec => {
            if (rec.date === todayStr && rec.pillName === m.name && rec.status === 'Missed' && !convertedMissed) {
              convertedMissed = true;
              // Convert missed into taken!
              return { ...rec, status: 'Taken', onTime: false, takenAt: timeStr };
            }
            return rec;
          });

          // If no previous missed record was found, add a clean Taken record
          if (!convertedMissed) {
            nextHist.unshift({ 
              date: todayStr, 
              pillName: m.name, 
              time: m.time, 
              status: 'Taken', 
              onTime: true, 
              takenAt: timeStr 
            });
          }

          if (currentUser?.id) {
            AsyncStorage.setItem(`@adherence_history_${currentUser.id}`, JSON.stringify(nextHist)).catch(() => {});
          }
          if (targetOwnerId && targetOwnerId !== currentUser?.id) {
            AsyncStorage.setItem(`@adherence_history_${targetOwnerId}`, JSON.stringify(nextHist)).catch(() => {});
          }
          AsyncStorage.setItem('@adherence_history', JSON.stringify(nextHist)).catch(() => {});
          return nextHist;
        });

        return { ...m, statusToday: 'taken', takenAt: timeStr };
      }
      return m;
    });

    saveMedications(updated);
    setActiveAlarmMeds(prev => prev.filter(m => m.id !== medId));

    // Resolve any active escalation alert in memory & in Firestore
    setEscalationAlert(null);
    resolveCloudEscalation(targetOwner).catch(() => {});

    await updateMedicationStatusInCloud(medId, 'taken', timeStr);
  };

  // Mark all currently ringing alarm pills as taken (for combo pills)
  const markAllAsTaken = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];
    const medIds = new Set(activeAlarmMeds.map(m => m.id));

    let targetOwner = currentUser?.id || 'self';

    for (const m of activeAlarmMeds) {
      const pendingNotifId = pendingEscalationsRef.current[m.id];
      if (pendingNotifId) {
        cancelScheduledNotification(pendingNotifId);
        delete pendingEscalationsRef.current[m.id];
      }
      const targetOwnerId = m.patientId || currentUser?.id || 'self';
      targetOwner = targetOwnerId;

      setAdherenceHistory(prev => {
        let convertedMissed = false;
        const nextHist = prev.map(rec => {
          if (rec.date === todayStr && rec.pillName === m.name && rec.status === 'Missed' && !convertedMissed) {
            convertedMissed = true;
            return { ...rec, status: 'Taken', onTime: false, takenAt: timeStr };
          }
          return rec;
        });

        if (!convertedMissed) {
          nextHist.unshift({ 
            date: todayStr, 
            pillName: m.name, 
            time: m.time, 
            status: 'Taken', 
            onTime: true, 
            takenAt: timeStr 
          });
        }

        if (currentUser?.id) {
          AsyncStorage.setItem(`@adherence_history_${currentUser.id}`, JSON.stringify(nextHist)).catch(() => {});
        }
        if (targetOwnerId && targetOwnerId !== currentUser?.id) {
          AsyncStorage.setItem(`@adherence_history_${targetOwnerId}`, JSON.stringify(nextHist)).catch(() => {});
        }
        AsyncStorage.setItem('@adherence_history', JSON.stringify(nextHist)).catch(() => {});
        return nextHist;
      });

      updateMedicationStatusInCloud(m.id, 'taken', timeStr).catch(() => {});
    }

    const updated = medications.map(m => medIds.has(m.id) ? { ...m, statusToday: 'taken', takenAt: timeStr } : m);
    saveMedications(updated);
    setActiveAlarmMeds([]);
    setEscalationAlert(null);
    resolveCloudEscalation(targetOwner).catch(() => {});
  };

  // Patient snoozes alarm (single or combo)
  const snoozeAlarm = (medId) => {
    const targetMeds = medId ? activeAlarmMeds.filter(m => m.id === medId) : activeAlarmMeds;
    const now = Date.now();
    const newTarget = now + 60 * 1000;

    for (const m of targetMeds) {
      const pendingNotifId = pendingEscalationsRef.current[m.id];
      if (pendingNotifId) {
        cancelScheduledNotification(pendingNotifId);
        delete pendingEscalationsRef.current[m.id];
      }
      firedAlarmIdsRef.current.delete(m.id);
      scheduleMedicationAlarm(m, 60);
    }

    const targetSet = new Set(targetMeds.map(t => t.id));
    const updated = medications.map(m => targetSet.has(m.id) ? { ...m, targetTimestamp: newTarget } : m);
    saveMedications(updated);

    if (medId) {
      setActiveAlarmMeds(prev => prev.filter(m => m.id !== medId));
    } else {
      setActiveAlarmMeds([]);
    }
    alert('Alarm snoozed! Will automatically ring again in 1 minute.');
  };

  // Trigger Missed Escalation -> FIRES REAL ANDROID NOTIFICATION TRAY ALERT & DISPATCHES SMS!
  const triggerMissedEscalation = async (medOrMeds) => {
    const medsArray = Array.isArray(medOrMeds) ? medOrMeds : [medOrMeds];
    if (medsArray.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const medIds = new Set(medsArray.map(m => m.id));

    for (const med of medsArray) {
      const pendingNotifId = pendingEscalationsRef.current[med.id];
      if (pendingNotifId) {
        delete pendingEscalationsRef.current[med.id];
      }
    }

    const updated = medications.map(m => medIds.has(m.id) ? { ...m, statusToday: 'missed' } : m);
    saveMedications(updated);

    const firstMed = medsArray[0];
    const owningPatient = patients.find(p => p.id === firstMed.patientId);
    const resolvedPatientName = firstMed.patientName || (userRole === 'PATIENT' ? currentUser?.name : owningPatient?.name) || 'Patient';
    const resolvedPatientId = firstMed.patientId || owningPatient?.id || (userRole === 'PATIENT' ? currentUser?.id : selectedPatientId);
    const combinedPillNames = medsArray.map(m => m.name).join(', ');
    const phoneToAlert = owningPatient?.emergencyPhone || owningPatient?.phone || caretakerPhone || currentUser?.emergencyCaretakerPhone;

    for (const med of medsArray) {
      const targetOwnerId = med.patientId || currentUser?.id || 'self';
      const missedRecord = { date: todayStr, pillName: med.name, time: med.time, status: 'Missed', onTime: false };
      setAdherenceHistory(prev => {
        const nextHist = [missedRecord, ...prev];
        if (currentUser?.id) {
          AsyncStorage.setItem(`@adherence_history_${currentUser.id}`, JSON.stringify(nextHist)).catch(() => {});
        }
        if (targetOwnerId && targetOwnerId !== currentUser?.id) {
          AsyncStorage.setItem(`@adherence_history_${targetOwnerId}`, JSON.stringify(nextHist)).catch(() => {});
        }
        AsyncStorage.setItem('@adherence_history', JSON.stringify(nextHist)).catch(() => {});
        return nextHist;
      });
      updateMedicationStatusInCloud(med.id, 'missed').catch(() => {});
    }

    setActiveAlarmMeds(prev => prev.filter(m => !medIds.has(m.id)));

    const alertPayload = {
      patientId: resolvedPatientId,
      patientName: resolvedPatientName,
      pillName: combinedPillNames,
      scheduledTime: firstMed.time,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      phone: phoneToAlert,
    };

    setEscalationAlert(alertPayload);

    // 1. Sync to Cloud Firestore
    await triggerCloudEscalation(alertPayload);

    // 2. FIRES ACTUAL ANDROID SYSTEM NOTIFICATION DIRECTLY ON PHONE!
    await triggerCaretakerPushAlert(
      alertPayload.patientName,
      alertPayload.pillName,
      alertPayload.scheduledTime
    );

    // 3. Dispatch SMS alert to registered emergency caretaker phone
    if (phoneToAlert) {
      sendMissedMedicationSMS(phoneToAlert, resolvedPatientName, combinedPillNames, firstMed.time);
    }
  };

  // Add new medicine (from Caretaker or Patient)
  const addMedication = async (newMed) => {
    const now = Date.now();
    const targetTimestamp = parseTimeToTimestamp(newMed.time, now);

    // Target patient ID and patient name:
    let targetPatientId;
    let targetPatientName;

    if (userRole === 'CARETAKER') {
      const currentPat = patients.find(p => p.id === selectedPatientId) || patients[0];
      targetPatientId = currentPat?.id || selectedPatientId || 'patient_1';
      targetPatientName = currentPat?.name || 'Patient';
    } else {
      targetPatientId = currentUser?.id || 'self';
      targetPatientName = currentUser?.name || 'Patient';
    }

    const item = {
      ...newMed,
      id: 'm_' + now,
      patientId: targetPatientId,
      patientName: targetPatientName,
      targetTimestamp: targetTimestamp,
      statusToday: 'pending',
      takenAt: null,
    };

    firedAlarmIdsRef.current.delete(item.id);

    const updated = [...medications, item];
    saveMedications(updated);

    // Save under patient's scoped storage key so both patient and caretaker see it
    if (targetPatientId) {
      try {
        let pMeds = [];
        const pMedsStr = await AsyncStorage.getItem(`@patient_medications_${targetPatientId}`);
        if (pMedsStr) pMeds = JSON.parse(pMedsStr);
        pMeds = [...pMeds.filter(m => m.id !== item.id), item];
        await AsyncStorage.setItem(`@patient_medications_${targetPatientId}`, JSON.stringify(pMeds));
      } catch (e) {}
    }

    await addMedicationToCloud(item);

    const delay = Math.max(1, Math.round((targetTimestamp - now) / 1000));
    scheduleMedicationAlarm(item, delay);

    // Schedule 10-minute pre-alarm notification in the tray
    if (delay > 600) {
      schedulePreAlarmNotification(item, delay - 600);
    } else if (delay > 300) {
      schedulePreAlarmNotification(item, delay - 300);
    }

    // Caretaker background escalation notification
    const patientObj = patients.find(p => p.id === targetPatientId);
    const patientName = patientObj?.name || currentUser?.name || 'Patient';
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

  // Update existing medicine
  const updateMedication = async (updatedMed) => {
    const now = Date.now();
    const targetTimestamp = parseTimeToTimestamp(updatedMed.time, now);
    const item = {
      ...updatedMed,
      targetTimestamp,
    };

    firedAlarmIdsRef.current.delete(item.id);

    const updated = medications.map(m => m.id === item.id ? item : m);
    saveMedications(updated);

    if (item.patientId) {
      try {
        let pMeds = [];
        const pMedsStr = await AsyncStorage.getItem(`@patient_medications_${item.patientId}`);
        if (pMedsStr) pMeds = JSON.parse(pMedsStr);
        pMeds = pMeds.map(m => m.id === item.id ? item : m);
        await AsyncStorage.setItem(`@patient_medications_${item.patientId}`, JSON.stringify(pMeds));
      } catch (e) {}
    }

    const delay = Math.max(1, Math.round((targetTimestamp - now) / 1000));
    scheduleMedicationAlarm(item, delay);
    if (delay > 600) {
      schedulePreAlarmNotification(item, delay - 600);
    } else if (delay > 300) {
      schedulePreAlarmNotification(item, delay - 300);
    }
  };

  // Delete medicine
  const deleteMedication = async (medId) => {
    const pendingNotifId = pendingEscalationsRef.current[medId];
    if (pendingNotifId) {
      cancelScheduledNotification(pendingNotifId);
      delete pendingEscalationsRef.current[medId];
    }
    firedAlarmIdsRef.current.delete(medId);
    setActiveAlarmMeds(prev => prev.filter(m => m.id !== medId));

    const targetMed = medications.find(m => m.id === medId);
    const updated = medications.filter(m => m.id !== medId);
    saveMedications(updated);

    if (targetMed?.patientId) {
      try {
        let pMeds = [];
        const pMedsStr = await AsyncStorage.getItem(`@patient_medications_${targetMed.patientId}`);
        if (pMedsStr) {
          pMeds = JSON.parse(pMedsStr).filter(m => m.id !== medId);
          await AsyncStorage.setItem(`@patient_medications_${targetMed.patientId}`, JSON.stringify(pMeds));
        }
      } catch (e) {}
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

  // Pair Patient by Code (Strict Verification, Real Data, Zero Dummy Fallbacks)
  const pairPatientByCode = async (code, relation = 'Doctor') => {
    const cleanCode = code.trim().toUpperCase();

    // 1. Search local registered users map
    let foundPatient = null;
    try {
      const mapStr = await AsyncStorage.getItem('@registered_users_map');
      if (mapStr) {
        const usersMap = JSON.parse(mapStr);
        for (const email of Object.keys(usersMap)) {
          const user = usersMap[email];
          if (user.pairingCode && user.pairingCode.toUpperCase() === cleanCode) {
            foundPatient = {
              id: user.id,
              name: user.name,
              age: user.age ? Number(user.age) : null,
              phone: user.phone || '',
              code: user.pairingCode,
              relation: relation,
              emergencyPhone: user.emergencyCaretakerPhone || '',
            };
            break;
          }
        }
      }
    } catch (e) {
      console.log('Local patient lookup error:', e);
    }

    // 2. If not found in local map, search Cloud Firestore
    if (!foundPatient) {
      const cloudPatient = await findPatientByCodeInCloud(cleanCode);
      if (cloudPatient) {
        foundPatient = {
          ...cloudPatient,
          age: cloudPatient.age ? Number(cloudPatient.age) : null,
          relation: relation,
        };
      }
    }

    // 3. If STILL not found: STRICTLY REJECT!
    if (!foundPatient) {
      return {
        success: false,
        error: `No registered patient found with code "${code}". Please verify the 6-digit code with the patient.`
      };
    }

    // 4. Patient exists! Add to Caretaker's monitored patients
    const updatedPatients = [
      ...patients.filter(p => p.id !== foundPatient.id && p.code?.toUpperCase() !== cleanCode),
      foundPatient
    ];
    setPatients(updatedPatients);
    setSelectedPatientId(foundPatient.id);

    // Persist in storage
    await AsyncStorage.setItem('@patients', JSON.stringify(updatedPatients));
    if (currentUser?.id) {
      await AsyncStorage.setItem(`@patients_${currentUser.id}`, JSON.stringify(updatedPatients));
    }

    // 5. Load this patient's medications immediately!
    try {
      const pMedsStr = await AsyncStorage.getItem(`@patient_medications_${foundPatient.id}`);
      if (pMedsStr) {
        const pMeds = JSON.parse(pMedsStr);
        setMedications(prev => {
          const others = prev.filter(m => m.patientId !== foundPatient.id);
          return [...others, ...pMeds];
        });
      }
    } catch (e) {
      console.log('Error loading patient medications:', e);
    }

    return { success: true, patient: foundPatient };
  };

  // Remove / Unlink Patient from Caretaker Dashboard
  const removePatient = async (patientId) => {
    const updated = patients.filter(p => p.id !== patientId);
    setPatients(updated);

    // If current selected patient was removed, switch to next available patient or null
    if (selectedPatientId === patientId) {
      setSelectedPatientId(updated.length > 0 ? updated[0].id : null);
    }

    // Update storage
    await AsyncStorage.setItem('@patients', JSON.stringify(updated));
    if (currentUser?.id) {
      await AsyncStorage.setItem(`@patients_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  // Permanently Delete Current User Account (Purges from Cloud Firestore & unlinks from Caretaker mode!)
  const deleteUserAccount = async () => {
    if (!currentUser) return;
    const emailKey = currentUser.email?.toLowerCase();
    const userId = currentUser.id;
    const pairingCode = currentUser.pairingCode;

    try {
      // 1. Remove from local registered users map AND un-link from any caretaker accounts
      const mapStr = await AsyncStorage.getItem('@registered_users_map');
      if (mapStr) {
        const usersMap = JSON.parse(mapStr);
        if (emailKey && usersMap[emailKey]) {
          delete usersMap[emailKey];
        }

        // Scan all other registered users (e.g. Dr. Sharma / caretakers on this device)
        // and remove this patient so caretaker mode will no longer see them!
        for (const key of Object.keys(usersMap)) {
          const u = usersMap[key];
          if (Array.isArray(u.linkedPatients)) {
            u.linkedPatients = u.linkedPatients.filter(
              p => p.id !== userId && p.code !== pairingCode
            );
          }
          if (u.id) {
            try {
              const uPatStr = await AsyncStorage.getItem(`@patients_${u.id}`);
              if (uPatStr) {
                const uPats = JSON.parse(uPatStr).filter(
                  p => p.id !== userId && p.code !== pairingCode
                );
                await AsyncStorage.setItem(`@patients_${u.id}`, JSON.stringify(uPats));
              }
            } catch (err) {}
          }
        }
        await AsyncStorage.setItem('@registered_users_map', JSON.stringify(usersMap));
      }

      // 2. Remove user-scoped data
      if (userId) {
        await AsyncStorage.removeItem(`@patients_${userId}`);
        await AsyncStorage.removeItem(`@medications_${userId}`);
        await AsyncStorage.removeItem(`@patient_medications_${userId}`);
        await AsyncStorage.removeItem(`@adherence_history_${userId}`);
      }

      // 3. Clear session keys
      await AsyncStorage.removeItem('@active_user_session');
      await AsyncStorage.removeItem('@med_user');
      await AsyncStorage.removeItem('@patients');
      await AsyncStorage.removeItem('@medications');
      await AsyncStorage.removeItem('@adherence_history');

      // 4. Completely purge from Cloud Firestore (user doc, patient doc, medications, escalations & caretaker links!)
      await deletePatientCompletelyFromCloud(userId, pairingCode, emailKey);

      // 5. Reset all in-memory states
      setCurrentUser(null);
      setUserRole('PATIENT');
      setPatients([]);
      setMedications([]);
      setSelectedPatientId(null);
      setAdherenceHistory([]);
      setActiveAlarmMed(null);
      setEscalationAlert(null);
      firedAlarmIdsRef.current.clear();
      pendingEscalationsRef.current = {};
    } catch (e) {
      console.log('Error deleting account:', e);
    }
  };

  // Completely Wipe All Local & Session Data (Clean Slate to Start Fresh)
  const resetEntireAppData = async () => {
    try {
      await AsyncStorage.clear();
      setCurrentUser(null);
      setUserRole('PATIENT');
      setPatients([]);
      setMedications([]);
      setSelectedPatientId(null);
      setAdherenceHistory([]);
      setActiveAlarmMed(null);
      setEscalationAlert(null);
      firedAlarmIdsRef.current.clear();
      pendingEscalationsRef.current = {};
      console.log('App storage completely reset to clean state.');
    } catch (e) {
      console.log('Error resetting app storage:', e);
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
        deleteUserAccount,
        resetEntireAppData,
        selectedPatientId,
        setSelectedPatientId,
        patients,
        addPatient,
        removePatient,
        pairPatientByCode,
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        markAsTaken,
        markAllAsTaken,
        snoozeAlarm,
        activeAlarmMed,
        activeAlarmMeds,
        setActiveAlarmMeds,
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
