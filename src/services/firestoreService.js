import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where 
} from './firebaseConfig';

// -------------------------------------------------------------
// FIRESTORE BACKEND SERVICE LAYER
// Handles Real-Time Cross-Device Synchronization
// -------------------------------------------------------------

/**
 * 1. REAL-TIME MEDICATION LISTENER
 * Listens for changes to a patient's prescriptions. When a caretaker adds
 * or modifies a pill on their phone, this triggers on the patient's phone instantly!
 */
export const subscribeToPatientMedications = (patientId, onUpdate) => {
  if (!isFirebaseConfigured() || !db) {
    console.log('[Backend] Using local-sync for medications');
    return () => {}; // return unsubscriber dummy
  }

  try {
    const q = query(collection(db, 'medications'), where('patientId', '==', patientId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = [];
      snapshot.forEach((d) => {
        meds.push({ id: d.id, ...d.data() });
      });
      console.log(`[Backend] Synced ${meds.length} medications from Cloud Firestore`);
      onUpdate(meds);
    }, (error) => {
      console.log('[Backend] Firestore listener error:', error.message);
    });

    return unsubscribe;
  } catch (error) {
    console.log('[Backend] Subscribe error:', error.message);
    return () => {};
  }
};

/**
 * 2. UPDATE MEDICATION STATUS IN CLOUD
 * When patient taps "Taken" or misses an alarm, this writes to Firestore.
 */
export const updateMedicationStatusInCloud = async (medId, status, takenAt = null) => {
  if (!isFirebaseConfigured() || !db) return false;

  try {
    const medRef = doc(db, 'medications', medId);
    await updateDoc(medRef, {
      statusToday: status,
      takenAt: takenAt,
      lastUpdated: new Date().toISOString(),
    });
    console.log(`[Backend] Updated pill ${medId} to ${status} in Cloud Firestore`);
    return true;
  } catch (error) {
    console.log('[Backend] Update error:', error.message);
    return false;
  }
};

/**
 * 3. ADD NEW MEDICATION (From Caretaker)
 * Writes new prescription to Cloud Firestore.
 */
export const addMedicationToCloud = async (medData) => {
  if (!isFirebaseConfigured() || !db) return null;

  try {
    const docRef = await addDoc(collection(db, 'medications'), {
      ...medData,
      statusToday: 'pending',
      takenAt: null,
      createdAt: new Date().toISOString(),
    });
    console.log(`[Backend] Added new medication ${docRef.id} to Cloud Firestore`);
    return docRef.id;
  } catch (error) {
    console.log('[Backend] Add error:', error.message);
    return null;
  }
};

/**
 * 4. REAL-TIME ESCALATION LISTENER (For Caretaker Phone)
 * Listens for missed medication alerts across the internet.
 */
export const subscribeToEscalationAlerts = (patientId, onAlert) => {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const q = query(
      collection(db, 'escalations'), 
      where('patientId', '==', patientId),
      where('active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const alertDoc = snapshot.docs[0];
        onAlert({ id: alertDoc.id, ...alertDoc.data() });
      } else {
        onAlert(null);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.log('[Backend] Escalation listener error:', error.message);
    return () => {};
  }
};

/**
 * 5. TRIGGER ESCALATION IN CLOUD
 * Called when patient does not dismiss the 60-second alarm.
 */
export const triggerCloudEscalation = async (alertPayload) => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    await addDoc(collection(db, 'escalations'), {
      ...alertPayload,
      active: true,
      timestamp: new Date().toISOString(),
    });
    console.log('[Backend] Escalation alert published to Cloud Firestore');
  } catch (error) {
    console.log('[Backend] Escalation trigger error:', error.message);
  }
};

/**
 * 6. PAIR PATIENT BY 6-DIGIT CODE
 * Caretaker enters patient's code -> Firestore links them.
 */
export const findPatientByCodeInCloud = async (pairingCode) => {
  if (!isFirebaseConfigured() || !db || !pairingCode) return null;

  try {
    const cleanCode = pairingCode.toUpperCase();

    // Check 'users' collection where pairingCode matches
    const qUsers = query(collection(db, 'users'), where('pairingCode', '==', cleanCode));
    const snapUsers = await getDocs(qUsers);
    if (!snapUsers.empty) {
      const uDoc = snapUsers.docs[0];
      const data = uDoc.data();
      return {
        id: data.id || uDoc.id,
        name: data.name,
        age: data.age,
        phone: data.phone,
        code: data.pairingCode,
        emergencyPhone: data.emergencyCaretakerPhone || '',
      };
    }

    // Check 'patients' collection
    const qPatients = query(collection(db, 'patients'), where('code', '==', cleanCode));
    const snapPatients = await getDocs(qPatients);
    if (!snapPatients.empty) {
      const patientDoc = snapPatients.docs[0];
      const pData = patientDoc.data();
      return {
        id: patientDoc.id,
        name: pData.name,
        age: pData.age,
        phone: pData.phone,
        code: pData.code,
        emergencyPhone: pData.emergencyPhone || '',
      };
    }

    return null;
  } catch (error) {
    console.log('[Backend] Pairing lookup error:', error.message);
    return null;
  }
};

export const savePatientToCloud = async (patientData) => {
  if (!isFirebaseConfigured() || !db || !patientData?.id) return false;

  try {
    const patientRef = doc(db, 'patients', patientData.id);
    await setDoc(patientRef, {
      ...patientData,
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Backend] Saved patient ${patientData.name} to Cloud Firestore`);
    return true;
  } catch (error) {
    console.log('[Backend] Patient cloud save error:', error.message);
    return false;
  }
};

/**
 * 7. USER AUTH CLOUD PERSISTENCE
 * Saves registered users and restores user accounts across sessions/devices.
 */
export const saveUserToCloud = async (userData) => {
  if (!isFirebaseConfigured() || !db || !userData?.email) return false;

  try {
    const userEmailDoc = userData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const userRef = doc(db, 'users', userEmailDoc);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Backend] Saved user ${userData.email} to Cloud Firestore`);
    return true;
  } catch (error) {
    console.log('[Backend] User cloud save error:', error.message);
    return false;
  }
};

export const findUserInCloud = async (email) => {
  if (!isFirebaseConfigured() || !db || !email) return null;

  try {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.log('[Backend] User cloud lookup error:', error.message);
    return null;
  }
};

export const deleteUserFromCloud = async (email) => {
  if (!isFirebaseConfigured() || !db || !email) return false;

  try {
    const userEmailDoc = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const userRef = doc(db, 'users', userEmailDoc);
    await deleteDoc(userRef);
    console.log(`[Backend] Deleted user ${email} from Cloud Firestore`);
    return true;
  } catch (error) {
    console.log('[Backend] User cloud delete error:', error.message);
    return false;
  }
};

/**
 * 8. COMPLETE PATIENT PURGE FROM CLOUD FIRESTORE
 * Deletes user doc, patient doc, all medications, escalations,
 * and removes this patient from all caretaker accounts so caretaker mode no longer shows them!
 */
export const deletePatientCompletelyFromCloud = async (patientId, pairingCode, email) => {
  if (!isFirebaseConfigured() || !db) return false;

  try {
    // 1. Delete user account document
    if (email) {
      const userEmailDoc = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
      await deleteDoc(doc(db, 'users', userEmailDoc)).catch(() => {});
    }

    // 2. Delete patient doc from 'patients'
    if (patientId) {
      await deleteDoc(doc(db, 'patients', patientId)).catch(() => {});
    }
    if (pairingCode) {
      const qPat = query(collection(db, 'patients'), where('code', '==', pairingCode.toUpperCase()));
      const snapPat = await getDocs(qPat);
      snapPat.forEach(async (d) => {
        await deleteDoc(d.ref).catch(() => {});
      });
    }

    // 3. Purge all medications belonging to this patient
    if (patientId) {
      const qMeds = query(collection(db, 'medications'), where('patientId', '==', patientId));
      const snapMeds = await getDocs(qMeds);
      snapMeds.forEach(async (d) => {
        await deleteDoc(d.ref).catch(() => {});
      });
    }

    // 4. Purge escalations
    if (patientId) {
      const qEsc = query(collection(db, 'escalations'), where('patientId', '==', patientId));
      const snapEsc = await getDocs(qEsc);
      snapEsc.forEach(async (d) => {
        await deleteDoc(d.ref).catch(() => {});
      });

      // Purge adherence history
      const qAdh = query(collection(db, 'adherenceHistory'), where('patientId', '==', patientId));
      const snapAdh = await getDocs(qAdh);
      snapAdh.forEach(async (d) => {
        await deleteDoc(d.ref).catch(() => {});
      });
    }

    // 5. Remove this patient from any caretaker's linkedPatients array in Firestore
    const snapAllUsers = await getDocs(collection(db, 'users'));
    snapAllUsers.forEach(async (uDoc) => {
      const uData = uDoc.data();
      if (Array.isArray(uData.linkedPatients)) {
        const filtered = uData.linkedPatients.filter(
          p => p.id !== patientId && p.code !== pairingCode
        );
        if (filtered.length !== uData.linkedPatients.length) {
          await updateDoc(uDoc.ref, { linkedPatients: filtered }).catch(() => {});
        }
      }
    });

    console.log(`[Backend] Purged patient ${patientId} and pairing code ${pairingCode} completely from Firestore`);
    return true;
  } catch (error) {
    console.log('[Backend] Error deleting patient from cloud:', error.message);
    return false;
  }
};

/**
 * 9. RESOLVE ACTIVE CLOUD ESCALATION
 * Deactivates escalation in Firestore when patient marks pill taken.
 */
export const resolveCloudEscalation = async (patientId) => {
  if (!isFirebaseConfigured() || !db || !patientId) return;

  try {
    const qEsc = query(
      collection(db, 'escalations'),
      where('patientId', '==', patientId),
      where('active', '==', true)
    );
    const snap = await getDocs(qEsc);
    snap.forEach(async (d) => {
      await updateDoc(d.ref, { 
        active: false, 
        resolvedAt: new Date().toISOString() 
      }).catch(() => {});
    });
    console.log(`[Backend] Resolved active cloud escalations for patient ${patientId}`);
  } catch (error) {
    console.log('[Backend] Error resolving cloud escalation:', error.message);
  }
};

/**
 * 10. SAVE ADHERENCE RECORD TO CLOUD
 * Writes an adherence event (Taken / Missed) to Cloud Firestore.
 */
export const saveAdherenceRecordToCloud = async (patientId, record) => {
  if (!isFirebaseConfigured() || !db || !patientId) return false;

  try {
    const docId = record.id || `adh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const adherenceRef = doc(db, 'adherenceHistory', docId);
    await setDoc(adherenceRef, {
      ...record,
      id: docId,
      patientId: patientId,
      timestamp: record.timestamp || Date.now(),
      createdAt: new Date().toISOString(),
    });
    console.log(`[Backend] Saved adherence record ${docId} for patient ${patientId} to Cloud Firestore`);
    return true;
  } catch (error) {
    console.log('[Backend] saveAdherenceRecord error:', error.message);
    return false;
  }
};

/**
 * 11. REAL-TIME ADHERENCE HISTORY LISTENER (For Caretaker Phone)
 * Dynamically streams adherence logs (Taken / Missed) for a specific patient.
 */
export const subscribeToPatientAdherence = (patientId, onUpdate) => {
  if (!isFirebaseConfigured() || !db || !patientId) return () => {};

  try {
    const q = query(
      collection(db, 'adherenceHistory'), 
      where('patientId', '==', patientId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = [];
      snapshot.forEach((d) => {
        records.push({ id: d.id, ...d.data() });
      });
      // Sort newest first
      records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      console.log(`[Backend] Synced ${records.length} adherence records for patient ${patientId} from Cloud Firestore`);
      onUpdate(records);
    }, (error) => {
      console.log('[Backend] Adherence listener error:', error.message);
    });

    return unsubscribe;
  } catch (error) {
    console.log('[Backend] Subscribe adherence error:', error.message);
    return () => {};
  }
};
