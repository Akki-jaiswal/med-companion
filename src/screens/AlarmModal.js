import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, AppState, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { speakMedicationReminder, stopSpeech } from '../services/voiceService';

export const AlarmModal = () => {
  const { 
    activeAlarmMeds = [], 
    activeAlarmMed, 
    markAsTaken, 
    markAllAsTaken, 
    snoozeAlarm, 
    triggerMissedEscalation, 
    currentUser, 
    userRole 
  } = useApp();

  const [pulseAnim] = useState(new Animated.Value(1));
  const [isSpeaking, setIsSpeaking] = useState(true);
  
  // 60-second countdown based on actual timestamp (will NEVER freeze in background!)
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const timerRef = useRef(null);
  const deadlineRef = useRef(null);

  const currentMeds = activeAlarmMeds && activeAlarmMeds.length > 0 
    ? activeAlarmMeds 
    : (activeAlarmMed ? [activeAlarmMed] : []);

  const isVisible = currentMeds.length > 0 && userRole === 'PATIENT';
  const firstMed = currentMeds[0];

  // Accurately resolve patient name from the medication (never address Dr. Sharma/Caretaker)
  const patientName = firstMed?.patientName || (userRole === 'PATIENT' ? currentUser?.name : 'Patient');

  // Alarm appearance effect (STRICTLY for Patient mode)
  useEffect(() => {
    if (isVisible) {
      // Set fixed 60-second deadline from now
      deadlineRef.current = Date.now() + 60 * 1000;
      setSecondsRemaining(60);

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Speak Reminder out loud (handles multi-pill combo instructions automatically)
      speakMedicationReminder(currentMeds, patientName);
      setIsSpeaking(true);

      // Ticking timer computing from real-time deadline
      timerRef.current = setInterval(() => {
        if (!deadlineRef.current) return;
        const diff = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setSecondsRemaining(diff);
      }, 500);
    } else {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, currentMeds.length]);

  // AppState listener: catches countdown immediately when returning from background!
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isVisible && deadlineRef.current) {
        const diff = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setSecondsRemaining(diff);
      }
    });

    return () => subscription.remove();
  }, [isVisible]);

  // Clean side-effect when countdown finishes (Prevents React parent setState-in-render crash!)
  useEffect(() => {
    if (secondsRemaining === 0 && isVisible) {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
      setTimeout(() => {
        triggerMissedEscalation(currentMeds);
      }, 50);
    }
  }, [secondsRemaining, isVisible]);

  if (!isVisible) return null;

  const handleTakeAll = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    if (markAllAsTaken) {
      markAllAsTaken();
    } else {
      currentMeds.forEach(m => markAsTaken(m.id));
    }
  };

  const handleTakeSingle = (medId) => {
    markAsTaken(medId);
    if (currentMeds.length === 1) {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSnooze = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    snoozeAlarm();
  };

  const handleEscalateNow = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    triggerMissedEscalation(currentMeds);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakMedicationReminder(currentMeds, patientName);
      setIsSpeaking(true);
    }
  };

  const isCombo = currentMeds.length > 1;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Blinking / Pulsing Alarm Icon */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="notifications-outline" size={60} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.alertHeader}>
          {isCombo ? `⏰ COMBINED MEDICATION ALARM (${currentMeds.length} PILLS)` : '⏰ TIME FOR MEDICATION!'}
        </Text>
        <Text style={styles.alertSubheader}>
          {isCombo ? 'Please take your scheduled combination now with water' : 'Please take your prescribed dose now'}
        </Text>

        {/* Live Auto-Escalation Countdown Banner */}
        <View style={styles.countdownBanner}>
          <Ionicons name="timer-outline" size={18} color="#F87171" />
          <Text style={styles.countdownText}>
            Auto-alerting Caretaker in <Text style={styles.countdownNum}>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}s</Text>
          </Text>
        </View>

        {/* Voice Readout Toggle */}
        <TouchableOpacity style={styles.speakerBtn} onPress={toggleVoice}>
          <Ionicons name={isSpeaking ? "volume-high" : "volume-mute"} size={18} color="#38BDF8" />
          <Text style={styles.speakerBtnText}>
            {isSpeaking ? "Speaking Instructions..." : "Muted (Tap to Replay)"}
          </Text>
        </TouchableOpacity>

        {/* Medication Card(s) Showcase */}
        {isCombo ? (
          <View style={styles.comboCardContainer}>
            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {currentMeds.map((med, idx) => (
                <View key={med.id || idx} style={styles.comboPillRow}>
                  <View style={[styles.miniColorDot, { backgroundColor: med.color || '#3B82F6' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.comboPillName}>{med.name}</Text>
                    <Text style={styles.comboPillDosage}>💊 {med.dosage} • {med.mealCondition}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.singleTakeBtn} 
                    onPress={() => handleTakeSingle(med.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.singleTakeBtnText}>Take</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={[styles.colorIndicator, { backgroundColor: firstMed?.color || '#3B82F6' }]} />
            <Text style={styles.medName}>{firstMed?.name}</Text>
            <Text style={styles.medDosage}>💊 {firstMed?.dosage}</Text>
            
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="time-outline" size={16} color="#0D9488" />
                <Text style={styles.badgeText}>{firstMed?.time}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="restaurant-outline" size={16} color="#D97706" />
                <Text style={[styles.badgeText, { color: '#B45309' }]}>{firstMed?.mealCondition}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnTaken]} 
            onPress={handleTakeAll}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={26} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnTakenText}>
              {isCombo ? 'I HAVE TAKEN ALL DOSES' : 'I HAVE TAKEN IT'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnSnooze]} 
            onPress={handleSnooze}
            activeOpacity={0.8}
          >
            <Ionicons name="alarm-outline" size={20} color="#334155" style={{ marginRight: 6 }} />
            <Text style={styles.btnSnoozeText}>Snooze (1 Minute)</Text>
          </TouchableOpacity>

          {/* Instant Escalate Button */}
          <TouchableOpacity 
            style={styles.escalateDemoBtn}
            onPress={handleEscalateNow}
          >
            <Ionicons name="warning-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.escalateDemoText}>Skip & Alert Caretaker (SMS + Call)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  alertHeader: {
    fontSize: 21,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  alertSubheader: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  countdownText: {
    fontSize: 13,
    color: '#CBD5E1',
    marginLeft: 6,
  },
  countdownNum: {
    fontWeight: '900',
    color: '#EF4444',
  },
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 12,
    gap: 6,
  },
  speakerBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  comboCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  comboPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  miniColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  comboPillName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  comboPillDosage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  singleTakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  singleTakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  medName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  medDosage: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
    marginLeft: 6,
  },
  actionContainer: {
    width: '100%',
    marginTop: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginVertical: 5,
  },
  btnTaken: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnTakenText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnSnooze: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnSnoozeText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  escalateDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  escalateDemoText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
