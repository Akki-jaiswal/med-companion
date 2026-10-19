import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { speakMedicationReminder, stopSpeech } from '../services/voiceService';

export const AlarmModal = () => {
  const { activeAlarmMed, markAsTaken, snoozeAlarm, triggerMissedEscalation, currentUser, userRole } = useApp();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isSpeaking, setIsSpeaking] = useState(true);
  
  // 60-second countdown based on actual timestamp (will NEVER freeze in background!)
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const timerRef = useRef(null);
  const deadlineRef = useRef(null);

  // Accurately resolve patient name from the medication (never address Dr. Sharma/Caretaker)
  const patientName = activeAlarmMed?.patientName || (userRole === 'PATIENT' ? currentUser?.name : 'Patient');

  // Alarm appearance effect (STRICTLY for Patient mode)
  useEffect(() => {
    if (activeAlarmMed && userRole === 'PATIENT') {
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

      // Speak Reminder out loud
      speakMedicationReminder(activeAlarmMed, patientName);
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
  }, [activeAlarmMed, userRole]);

  // AppState listener: catches countdown immediately when returning from background!
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && activeAlarmMed && deadlineRef.current) {
        const diff = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setSecondsRemaining(diff);
      }
    });

    return () => subscription.remove();
  }, [activeAlarmMed]);

  // Clean side-effect when countdown finishes (Prevents React parent setState-in-render crash!)
  useEffect(() => {
    if (secondsRemaining === 0 && activeAlarmMed) {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
      // Safely notify parent after render cycle completes
      setTimeout(() => {
        triggerMissedEscalation(activeAlarmMed);
      }, 50);
    }
  }, [secondsRemaining, activeAlarmMed]);

  if (!activeAlarmMed || userRole !== 'PATIENT') return null;

  const handleTaken = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    markAsTaken(activeAlarmMed.id);
  };

  const handleSnooze = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    snoozeAlarm(activeAlarmMed.id);
  };

  const handleEscalateNow = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    triggerMissedEscalation(activeAlarmMed);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakMedicationReminder(activeAlarmMed, patientName);
      setIsSpeaking(true);
    }
  };

  return (
    <Modal visible={!!activeAlarmMed} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Blinking / Pulsing Alarm Icon */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="notifications-outline" size={68} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.alertHeader}>⏰ TIME FOR MEDICATION!</Text>
        <Text style={styles.alertSubheader}>Please take your prescribed dose now</Text>

        {/* Live Auto-Escalation Countdown Banner */}
        <View style={styles.countdownBanner}>
          <Ionicons name="timer-outline" size={18} color="#F87171" />
          <Text style={styles.countdownText}>
            Auto-alerting Caretaker in <Text style={styles.countdownNum}>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}s</Text>
          </Text>
        </View>

        {/* Medicine Detail Card */}
        <View style={styles.card}>
          <View style={[styles.colorIndicator, { backgroundColor: activeAlarmMed.color || '#3B82F6' }]} />
          <Text style={styles.medName}>{activeAlarmMed.name}</Text>
          <Text style={styles.medDosage}>💊 {activeAlarmMed.dosage}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={16} color="#0D9488" />
              <Text style={styles.badgeText}>{activeAlarmMed.time}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="restaurant-outline" size={16} color="#D97706" />
              <Text style={[styles.badgeText, { color: '#B45309' }]}>{activeAlarmMed.mealCondition}</Text>
            </View>
          </View>

          {/* Voice Controls */}
          <TouchableOpacity style={styles.speakerBtn} onPress={toggleVoice}>
            <Ionicons name={isSpeaking ? "volume-high" : "volume-mute"} size={18} color="#38BDF8" />
            <Text style={styles.speakerBtnText}>
              {isSpeaking ? "Speaking Instructions..." : "Muted (Tap to Replay)"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnTaken]} 
            onPress={handleTaken}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.btnTakenText}>I HAVE TAKEN IT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnSnooze]} 
            onPress={handleSnooze}
            activeOpacity={0.8}
          >
            <Ionicons name="alarm-outline" size={22} color="#334155" style={{ marginRight: 8 }} />
            <Text style={styles.btnSnoozeText}>Snooze (10 Mins)</Text>
          </TouchableOpacity>

          {/* Instant Escalate Button */}
          <TouchableOpacity 
            style={styles.escalateDemoBtn}
            onPress={handleEscalateNow}
          >
            <Ionicons name="warning-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.escalateDemoText}>Skip & Alert Caretaker Immediately</Text>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  alertHeader: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1,
    textAlign: 'center',
  },
  alertSubheader: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  countdownText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
  countdownNum: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  colorIndicator: {
    width: 48,
    height: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
  medName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  medDosage: {
    fontSize: 17,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
  },
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
    gap: 8,
  },
  speakerBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTaken: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  btnTakenText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnSnooze: {
    backgroundColor: '#E2E8F0',
  },
  btnSnoozeText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
  },
  escalateDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    padding: 8,
  },
  escalateDemoText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
