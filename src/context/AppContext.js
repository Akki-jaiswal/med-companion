import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Mode: 'PATIENT' or 'CARETAKER'
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

  // Medications list
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
    { date: '2026-10-23', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
    { date: '2026-10-23', pillName: 'Metformin', time: '01:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-23', pillName: 'Atorvastatin', time: '08:30 PM', status: 'Missed', onTime: false },
    { date: '2026-10-22', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
    { date: '2026-10-22', pillName: 'Metformin', time: '01:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-22', pillName: 'Atorvastatin', time: '08:30 PM', status: 'Taken', onTime: true },
    { date: '2026-10-21', pillName: 'Amlodipine', time: '08:00 AM', status: 'Taken', onTime: true },
  ]);

  // Full-screen alarm simulation state
  const [activeAlarmMed, setActiveAlarmMed] = useState(null);
  const [escalationAlert, setEscalationAlert] = useState(null);

  // Load from local storage on launch
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedMeds = await AsyncStorage.getItem('@medications');
        if (savedMeds) setMedications(JSON.parse(savedMeds));
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

  // Mark medicine as Taken
  const markAsTaken = (medId) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    const updated = medications.map(m => {
      if (m.id === medId) {
        // Record in history
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
    alert('Alarm snoozed for 10 minutes! We will ring again soon.');
  };

  // Simulate missed dose -> Triggers Escalation to Caretaker!
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

    // Escalation notification payload for Caretaker
    setEscalationAlert({
      patientName: 'Dad (Robert)',
      pillName: med.name,
      scheduledTime: med.time,
      timestamp: new Date().toLocaleTimeString(),
      phone: caretakerPhone,
    });
  };

  // Add new medicine (from Caretaker)
  const addMedication = (newMed) => {
    const item = {
      ...newMed,
      id: 'm_' + Date.now(),
      patientId: selectedPatientId,
      statusToday: 'pending',
      takenAt: null,
    };
    saveMedications([...medications, item]);
  };

  // Add new patient (from Caretaker)
  const addPatient = (patientData) => {
    const code = 'MED-' + Math.floor(1000 + Math.random() * 9000);
    const newP = {
      ...patientData,
      id: 'p_' + Date.now(),
      code: code,
    };
    setPatients([...patients, newP]);
    setSelectedPatientId(newP.id);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        selectedPatientId,
        setSelectedPatientId,
        patients,
        addPatient,
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
