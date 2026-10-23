import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Vibration, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { speakCaretakerEmergency, stopSpeech } from '../services/voiceService';
import { callCaretaker, sendMissedMedicationSMS } from '../services/emergencyService';

export const CaretakerEmergencyAlarmModal = () => {
  const { escalationAlert, setEscalationAlert, userRole, resolveCloudEscalation } = useApp();

  const [pulseAnim] = useState(new Animated.Value(1));
  const [isSpeaking, setIsSpeaking] = useState(true);

  const isVisible = Boolean(escalationAlert) && userRole === 'CARETAKER';

  useEffect(() => {
    if (isVisible && escalationAlert) {
      // Start pulsing siren animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start urgent voice loop and siren vibration
      speakCaretakerEmergency(
        escalationAlert.patientName,
        escalationAlert.pillName,
        escalationAlert.scheduledTime,
        true
      );
      setIsSpeaking(true);

      try {
        Vibration.vibrate([1000, 300, 1000, 300, 1000, 300, 1500], true);
      } catch (e) {}
    } else {
      stopSpeech();
      try {
        Vibration.cancel();
      } catch (e) {}
    }

    return () => {
      stopSpeech();
      try {
        Vibration.cancel();
      } catch (e) {}
    };
  }, [isVisible, escalationAlert?.timestamp]);

  if (!isVisible || !escalationAlert) return null;

  const handleCallPatient = () => {
    stopSpeech();
    try {
      Vibration.cancel();
    } catch (e) {}
    if (escalationAlert.phone) {
      callCaretaker(escalationAlert.phone);
    } else {
      alert(`No phone number registered for ${escalationAlert.patientName}.`);
    }
  };

  const handleSendSMS = () => {
    if (escalationAlert.phone) {
      sendMissedMedicationSMS(
        escalationAlert.phone,
        escalationAlert.patientName,
        escalationAlert.pillName,
        escalationAlert.scheduledTime
      );
    } else {
      alert(`No phone number available for ${escalationAlert.patientName}.`);
    }
  };

  const handleDismiss = () => {
    stopSpeech();
    try {
      Vibration.cancel();
    } catch (e) {}

    if (escalationAlert.patientId && typeof resolveCloudEscalation === 'function') {
      resolveCloudEscalation(escalationAlert.patientId).catch(() => {});
    }
    setEscalationAlert(null);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakCaretakerEmergency(
        escalationAlert.patientName,
        escalationAlert.pillName,
        escalationAlert.scheduledTime,
        true
      );
      setIsSpeaking(true);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Pulsing Siren Icon */}
        <Animated.View style={[styles.sirenCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="warning" size={62} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.alertHeader}>🚨 MISSED MEDICATION ALARM</Text>
        <Text style={styles.alertSubheader}>
          Immediate caretaker attention required
        </Text>

        <ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardContent}>
          {/* Patient Missed Dose Card */}
          <View style={styles.detailsCard}>
            <View style={styles.patientRow}>
              <View style={styles.patientAvatar}>
                <Ionicons name="person" size={24} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientNameText}>{escalationAlert.patientName}</Text>
                <Text style={styles.patientSubText}>Status: Missed Dose Escalation</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="medical" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>MISSED MEDICATION</Text>
                <Text style={styles.infoValue}>{escalationAlert.pillName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#EA580C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>SCHEDULED TIME</Text>
                <Text style={styles.infoValue}>{escalationAlert.scheduledTime}</Text>
              </View>
            </View>

            {escalationAlert.phone ? (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#0D9488" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>PATIENT PHONE</Text>
                  <Text style={styles.infoValue}>{escalationAlert.phone}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={18} color="#991B1B" />
              <Text style={styles.warningText}>
                The patient did not confirm taking this scheduled medication within the safety window. Please verify their well-being immediately.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          {/* Primary Call Patient Button */}
          <TouchableOpacity 
            style={styles.callNowButton} 
            onPress={handleCallPatient}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" />
            <Text style={styles.callNowButtonText}>Call {escalationAlert.patientName} Now</Text>
          </TouchableOpacity>

          {/* Secondary Actions Row: SMS & Mute Voice */}
          <View style={styles.secondaryRow}>
            {escalationAlert.phone ? (
              <TouchableOpacity 
                style={styles.smsButton}
                onPress={handleSendSMS}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
                <Text style={styles.secondaryBtnText}>Send SMS</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity 
              style={[styles.voiceButton, !isSpeaking && styles.voiceButtonMuted]}
              onPress={toggleVoice}
              activeOpacity={0.8}
            >
              <Ionicons name={isSpeaking ? 'volume-high' : 'volume-mute'} size={18} color="#FFFFFF" />
              <Text style={styles.secondaryBtnText}>{isSpeaking ? 'Mute Voice' : 'Unmute'}</Text>
            </TouchableOpacity>
          </View>

          {/* Dismiss Alert */}
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissButtonText}>Dismiss & Mark Acknowledged</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#450A0A',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  sirenCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  alertHeader: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FEE2E2',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  alertSubheader: {
    fontSize: 14,
    color: '#FCA5A5',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    fontWeight: '600',
  },
  cardScroll: {
    width: '100%',
    flex: 1,
  },
  cardContent: {
    paddingVertical: 4,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  patientSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#991B1B',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  callNowButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  callNowButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smsButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  voiceButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  voiceButtonMuted: {
    backgroundColor: '#334155',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
