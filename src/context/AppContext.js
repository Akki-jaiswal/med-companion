import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerForPushNotificationsAsync, 
  scheduleMedicationAlarm, 
  triggerCaretakerPushAlert 
} from '../services/notificationService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current Logged-in User Profile
  const [currentUser, setCurrentUser] = useState({
    id: 'u1',
    name: 'Akshay Jaiswal',
    email: 'akshay@medcompanion.com',
    role: 'PATIENT', // 'PATIENT' or 'CARETAKER'
    phone: '+919876543210',
    pairingCode: 'MED-7821',
    isAuthenticated: true,
  });

  // Current Role (synced with user)
  const [userRole, setUserRole] = useState('PATIENT');

  // Currently selected patient for caretaker view
  const [selectedPatientId, setSelectedPatientId] = useState('p1');

  // Caretaker Phone number for emergency SOS
  const [caretakerPhone, setCaretakerPhone] = useState('+919876543210');

  // Patients list (Caretaker can monitor multiple patients)
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

  // Medications list (Dynamic)
  const [medications, setMedications] = useState([
    {
      id: 'm1',
      patientId: 'p1',
      name: 'Amlodipine (Blood Pressure)',
      dosage: '5 mg - 1 Tablet',
      time: '08:00 AM',
      mealCondition: 'After Breakfast',
      color: '#3B82F6', // Blue pill
      shape: 'circle',
      statusToday: 'taken', // 'taken', 'pending', 'missed'
      takenAt: '08:05 AM',
    },
    {
      id: 'm2',
      patientId: 'p1',
      name: 'Metformin (Sugar)',
      dosage: '500 mg - 1 Tablet',
      time: '01:30 PM',
      mealCondition: 'After Lunch',
      color: '#EF4444', // Red pill
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
      mealCondition: 'After Dinner',
      color: '#10B981', // Green pill
      shape: 'square',
      statusToday: 'pending',
      takenAt: null,
    }
  ]);

  // Adherence History (Logs past week medication adherence)
  const [adherenceHistory, setAdherenceHistory] = useState([
    { date: '2026-10-04', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
    { date: '2026-10-04', pillName: 'Metformin', time: '01:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-04', pillName: 'Atorvastatin', time: '08:30 PM', status: 'Missed', onTime: false },
    { date: '2026-10-03', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
    { date: '2026-10-03', pillName: 'Metformin', time: '01:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-03', pillName: 'Atorvastatin', time: '08:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-02', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
  ]);

  // Full-screen alarm simulation state
  const [activeAlarmMed, setActiveAlarmMed] = useState(null);
  const [escalationAlert, setEscalationAlert] = useState(null);

  // Initialize notifications & load storage on launch
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

  // Save medications whenever changed
  const saveMedications = async (updatedMeds) => {
    setMedications(updatedMeds);
    try {
      await AsyncStorage.setItem('@medications', JSON.stringify(updatedMeds));
    } catch (e) {
      console.log('Error saving storage', e);
    }
  };

  // Register New User
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

    // If caretaker entered a code to pair on signup
    if (userData.patientCodeToLink) {
      pairPatientByCode(userData.patientCodeToLink, 'Monitored Patient');
    }
  };

  // Login User
  const loginUser = async (email, password, isDemo = false, demoRole = 'PATIENT') => {
    if (isDemo) {
      const demoUser = {
        id: 'u_' + Date.now(),
        name: demoRole === 'PATIENT' ? 'Akshay Jaiswal' : 'Akshita Bhati',
        email: demoRole === 'PATIENT' ? 'akshay@medcompanion.com' : 'akshita@medcompanion.com',
        role: demoRole,
        phone: '+919876543210',
        pairingCode: demoRole === 'PATIENT' ? 'MED-7821' : null,
        isAuthenticated: true,
      };
      setCurrentUser(demoUser);
      setUserRole(demoRole);
      await AsyncStorage.setItem('@med_user', JSON.stringify(demoUser));
      return true;
    }

    // Default match
    const userObj = {
      ...currentUser,
      email,
      isAuthenticated: true,
    };
    setCurrentUser(userObj);
    await AsyncStorage.setItem('@med_user', JSON.stringify(userObj));
    return true;
  };

  // Logout User
  const logoutUser = async () => {
    const loggedOut = { ...currentUser, isAuthenticated: false };
    setCurrentUser(loggedOut);
    await AsyncStorage.removeItem('@med_user');
  };

  // Switch Role
  const handleSetRole = (role) => {
    setUserRole(role);
    setCurrentUser(prev => ({ ...prev, role }));
  };

  // Mark medicine as Taken
  const markAsTaken = (medId) => {
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
  };

  // Patient snoozes alarm
  const snoozeAlarm = (medId) => {
    setActiveAlarmMed(null);
    scheduleMedicationAlarm(activeAlarmMed, 10 * 60); // Reschedule in 10 minutes!
    alert('Alarm snoozed for 10 minutes! Background notification set.');
  };

  // Simulate missed dose -> Triggers Escalation to Caretaker & Push Notification
  const triggerMissedEscalation = (med) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = medications.map(m => m.id === med.id ? { ...m, statusToday: 'missed' } : m);
    saveMedications(updated);

    // Record missed history
    setAdherenceHistory(prev => [
      { date: todayStr, pillName: med.name, time: med.time, status: 'Missed', onTime: false },
      ...prev
    ]);

    setActiveAlarmMed(null);

    const alertPayload = {
      patientName: currentUser?.name || 'Dad (Robert)',
      pillName: med.name,
      scheduledTime: med.time,
      timestamp: new Date().toLocaleTimeString(),
      phone: caretakerPhone,
    };

    setEscalationAlert(alertPayload);

    // Trigger REAL System Background Notification for Caretaker!
    triggerCaretakerPushAlert(alertPayload.patientName, alertPayload.pillName, alertPayload.scheduledTime);
  };

  // Add new medicine (from Caretaker) & schedule local background alarm!
  const addMedication = (newMed) => {
    const item = {
      ...newMed,
      id: 'm_' + Date.now(),
      patientId: selectedPatientId,
      statusToday: 'pending',
      takenAt: null,
    };
    saveMedications([...medications, item]);

    // Schedule background alarm (60s if "Test in 1 Min", or regular)
    const delay = newMed.time === 'In 1 Minute' ? 60 : 3600;
    scheduleMedicationAlarm(item, delay);
  };

  // Add new patient (from Caretaker)
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

  // Dynamic Pairing by 6-digit Code
  const pairPatientByCode = (code, fallbackName = 'Linked Patient') => {
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
