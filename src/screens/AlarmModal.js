import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { speakMedicationReminder, stopSpeech } from '../services/voiceService';

export const AlarmModal = () => {
  const { activeAlarmMed, markAsTaken, snoozeAlarm, triggerMissedEscalation } = useApp();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isSpeaking, setIsSpeaking] = useState(true);

  useEffect(() => {
    if (activeAlarmMed) {
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

      // Trigger Voice TTS Out Loud!
      speakMedicationReminder(activeAlarmMed, 'Robert');
      setIsSpeaking(true);
    } else {
      stopSpeech();
    }

    return () => {
      stopSpeech();
    };
  }, [activeAlarmMed]);

  if (!activeAlarmMed) return null;

  const handleTaken = () => {
    stopSpeech();
    markAsTaken(activeAlarmMed.id);
  };

  const handleSnooze = () => {
    stopSpeech();
    snoozeAlarm(activeAlarmMed.id);
  };

  const handleEscalate = () => {
    stopSpeech();
    triggerMissedEscalation(activeAlarmMed);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakMedicationReminder(activeAlarmMed, 'Robert');
      setIsSpeaking(true);
    }
  };

  return (
    <Modal visible={!!activeAlarmMed} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Blinking / Pulsing Alarm Icon */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="notifications-outline" size={72} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.alertHeader}>⏰ TIME FOR MEDICATION!</Text>
        <Text style={styles.alertSubheader}>Please take your prescribed dose now</Text>

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
            <Ionicons name={isSpeaking ? "volume-high" : "volume-mute"} size={20} color="#38BDF8" />
            <Text style={styles.speakerBtnText}>
              {isSpeaking ? "Voice: Speaking Reminder..." : "Voice Muted (Tap to Replay)"}
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
            <Ionicons name="checkmark-circle" size={30} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.btnTakenText}>I HAVE TAKEN IT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnSnooze]} 
            onPress={handleSnooze}
            activeOpacity={0.8}
          >
            <Ionicons name="alarm-outline" size={24} color="#334155" style={{ marginRight: 8 }} />
            <Text style={styles.btnSnoozeText}>Snooze (10 Mins)</Text>
          </TouchableOpacity>

          {/* Test Escalation Button for Demo */}
          <TouchableOpacity 
            style={styles.escalateDemoBtn}
            onPress={handleEscalate}
          >
            <Ionicons name="warning-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.escalateDemoText}>Test Missed Alarm (Notify Caretaker)</Text>
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
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  alertHeader: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1,
    textAlign: 'center',
  },
  alertSubheader: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
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
    height: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  medName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  medDosage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
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
    marginTop: 16,
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
    paddingVertical: 18,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnSnooze: {
    backgroundColor: '#E2E8F0',
  },
  btnSnoozeText: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '700',
  },
  escalateDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 8,
  },
  escalateDemoText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
