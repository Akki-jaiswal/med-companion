import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { sendSOSAlert } from '../services/emergencyService';
import { speakMedicationReminder } from '../services/voiceService';
import { scheduleTestAlarmNotification } from '../services/notificationService';
import { MedicineDetailModal } from './MedicineDetailModal';
import { AddMedicationModal } from './AddMedicationModal';

export const PatientHomeScreen = ({ onNavigateMedicines }) => {
  const { 
    currentUser,
    medications, 
    markAsTaken, 
    caretakerPhone 
  } = useApp();

  const [selectedMed, setSelectedMed] = useState(null);
  const [largeFontMode, setLargeFontMode] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Dynamic patient name
  const patientDisplayName = currentUser?.name || 'Patient';

  const isScheduledForToday = (med) => {
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

  const patientMeds = medications.filter(m => 
    !m.patientId || 
    m.patientId === 'self' || 
    m.patientId === currentUser?.id || 
    m.patientId === currentUser?.pairingCode
  );

  // Helper to convert time strings (e.g. "08:30 AM", "01:15 PM") to minutes from midnight for sorting
  const getTimeInMinutes = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const parts = timeStr.trim().split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10) || 0;
      const modifier = (parts[1] || 'AM').toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch (e) {
      return 0;
    }
  };

  // Stack sorting:
  // 1. Active / Pending / Missed pills sit at the top, ordered chronologically by scheduled time
  // 2. Taken pills get pushed to the bottom of the stack
  const todayMedsRaw = patientMeds.filter(isScheduledForToday);
  const todayMeds = [...todayMedsRaw].sort((a, b) => {
    const aTaken = a.statusToday === 'taken';
    const bTaken = b.statusToday === 'taken';
    if (aTaken !== bTaken) {
      return aTaken ? 1 : -1; // untaken first, taken at bottom
    }
    return getTimeInMinutes(a.time) - getTimeInMinutes(b.time);
  });

  const pendingCount = todayMeds.filter(m => m.statusToday === 'pending').length;

  const handleShareCode = async () => {
    if (!currentUser?.pairingCode) {
      Alert.alert('Patient Code', 'Your pairing code is being generated.');
      return;
    }
    try {
      await Share.share({
        message: `Hi! Here is my MedCompanion Patient Code: ${currentUser.pairingCode}. Please enter this in your Caretaker app to monitor my daily medications!`,
      });
    } catch (e) {
      Alert.alert('Your Code', currentUser.pairingCode);
    }
  };

  const handleTestAlarmNotification = async () => {
    const res = await scheduleTestAlarmNotification(5);
    if (res?.success) {
      Alert.alert(
        '🔔 Alarm Test Scheduled (5s)',
        'MedCompanion scheduled a test alarm notification in 5 seconds.\n\n👉 Minimize the app or lock your screen now. It will appear at the top in your Android notification shade!',
        [{ text: 'OK, Testing Now' }]
      );
    } else {
      Alert.alert(
        'Notification Notice',
        `Could not trigger system notification: ${res?.error || 'Unknown error'}. Please verify notification permissions.`
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Dynamic Patient Greeting & Status Banner */}
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeText, largeFontMode && { fontSize: 26 }]}>
            Hello, {patientDisplayName} 👋
          </Text>
          <Text style={[styles.subText, largeFontMode && { fontSize: 16 }]}>
            {pendingCount === 0 
              ? '🎉 All medications taken for today!' 
              : `You have ${pendingCount} pending medication${pendingCount > 1 ? 's' : ''}.`}
          </Text>
        </View>

        {/* Accessibility Large Font Toggle */}
        <TouchableOpacity 
          style={[styles.accessibilityBtn, largeFontMode && styles.accessibilityBtnActive]}
          onPress={() => setLargeFontMode(!largeFontMode)}
        >
          <Ionicons 
            name="text" 
            size={20} 
            color={largeFontMode ? '#FFFFFF' : '#0D9488'} 
          />
        </TouchableOpacity>
      </View>

      {/* BIG RED SOS BUTTON */}
      <TouchableOpacity 
        style={styles.sosCard} 
        onPress={() => sendSOSAlert(patientDisplayName, caretakerPhone)}
        activeOpacity={0.85}
      >
        <View style={styles.sosIconCircle}>
          <Ionicons name="call" size={34} color="#FFFFFF" />
        </View>
        <View style={styles.sosTextContainer}>
          <Text style={[styles.sosTitle, largeFontMode && { fontSize: 24 }]}>EMERGENCY SOS</Text>
          <Text style={[styles.sosSubtitle, largeFontMode && { fontSize: 15 }]}>
            Tap to immediately call Caretaker
          </Text>
        </View>
      </TouchableOpacity>

      {/* Section: Today's Schedule */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, largeFontMode && { fontSize: 24 }]}>Today's Medicines</Text>
          <Text style={styles.dateBadge}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity 
            style={styles.headerTestBtn}
            onPress={handleTestAlarmNotification}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={15} color="#0284C7" />
            <Text style={styles.headerTestBtnText}>Test (5s)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerAddBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#0D9488" />
            <Text style={styles.headerAddBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Medication Cards List */}
      {todayMeds.length > 0 ? (
        todayMeds.map((med) => {
          const isTaken = med.statusToday === 'taken';
          const isMissed = med.statusToday === 'missed';

          return (
            <TouchableOpacity 
              key={med.id} 
              style={[styles.medCard, isTaken && styles.medCardTaken]}
              onPress={() => setSelectedMed(med)}
              activeOpacity={0.9}
            >
              {/* Color Strip & Pill Icon */}
              <View style={[styles.pillColorBar, { backgroundColor: med.color || '#3B82F6' }]}>
                <Ionicons 
                  name={med.shape === 'capsule' ? 'medical' : 'ellipse'} 
                  size={22} 
                  color="#FFFFFF" 
                />
              </View>

              {/* Med Info */}
              <View style={styles.medContent}>
                <View style={styles.medTopRow}>
                  <Text style={[
                    styles.medName, 
                    largeFontMode && { fontSize: 21 },
                  ]}>
                    {med.name}
                  </Text>
                  
                  {/* Voice Readout Button */}
                  <TouchableOpacity 
                    style={styles.cardVoiceBtn}
                    onPress={() => speakMedicationReminder(med, patientDisplayName)}
                  >
                    <Ionicons name="volume-high" size={18} color="#0D9488" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.dosageText, largeFontMode && { fontSize: 16 }]}>
                  Dosage: {med.dosage}
                </Text>

                <View style={styles.medFooterRow}>
                  <View style={styles.timeTag}>
                    <Ionicons name="time" size={14} color="#64748B" />
                    <Text style={[styles.timeTagText, largeFontMode && { fontSize: 14 }]}>
                      {med.time}
                    </Text>
                  </View>
                  <View style={styles.mealTag}>
                    <Ionicons name="restaurant-outline" size={14} color="#0D9488" />
                    <Text style={[styles.mealTagText, largeFontMode && { fontSize: 14 }]}>
                      {med.mealCondition}
                    </Text>
                  </View>
                </View>

                {/* Status and Action Buttons */}
                <View style={styles.cardActionsContainer}>
                  {isMissed && !isTaken && (
                    <View style={styles.missedNoticeBadge}>
                      <Ionicons name="alert-circle" size={14} color="#DC2626" />
                      <Text style={styles.missedNoticeText}>Alarm time passed • Tap below to record as taken</Text>
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    {!isTaken ? (
                      <TouchableOpacity 
                        style={[styles.takeDoseBtn, isMissed && styles.takeDoseBtnMissed]}
                        onPress={() => markAsTaken(med.id)}
                      >
                        <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                        <Text style={[styles.takeDoseBtnText, largeFontMode && { fontSize: 16 }]}>
                          {isMissed ? 'Take Dose (Record as Taken)' : 'Take Dose'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.statusBadgeTakenFull}>
                        <Ionicons name="checkmark-done" size={16} color="#166534" />
                        <Text style={styles.statusTextTaken}>Taken at {med.takenAt}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        /* Clean Zero-Data Empty State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="medical-outline" size={44} color="#0D9488" />
          </View>
          <Text style={styles.emptyTitle}>
            {patientMeds.length > 0 ? 'No Medicines Scheduled Today' : 'No Medications Scheduled Yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {patientMeds.length > 0 
              ? `You have ${patientMeds.length} prescription(s) scheduled on other calendar days. Check the Medicines tab to manage them.`
              : 'Your schedule is currently empty. Tap below to add your first medicine, or share your code with your Caretaker.'}
          </Text>

          {/* Patient Code Share Box */}
          {currentUser?.pairingCode && (
            <View style={styles.emptyCodeBox}>
              <Text style={styles.emptyCodeLabel}>YOUR 6-DIGIT PATIENT CODE</Text>
              <Text style={styles.emptyCodeVal}>{currentUser.pairingCode}</Text>
              <TouchableOpacity style={styles.emptyShareBtn} onPress={handleShareCode}>
                <Ionicons name="share-social-outline" size={16} color="#0D9488" />
                <Text style={styles.emptyShareBtnText}>Share Code with Caretaker</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.emptyActionsRow}>
            <TouchableOpacity 
              style={styles.addMedEmptyBtn} 
              onPress={() => setAddModalVisible(true)}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addMedEmptyBtnText}>Add Medicine</Text>
            </TouchableOpacity>

            {onNavigateMedicines && (
              <TouchableOpacity 
                style={styles.viewPrescriptionsBtn} 
                onPress={onNavigateMedicines}
              >
                <Ionicons name="list-outline" size={18} color="#0D9488" />
                <Text style={styles.viewPrescriptionsBtnText}>All Medicines</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Detailed Pill Modal */}
      <MedicineDetailModal
        visible={!!selectedMed}
        med={selectedMed}
        onClose={() => setSelectedMed(null)}
        onMarkTaken={markAsTaken}
      />

      {/* Add Medication Modal */}
      <AddMedicationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  accessibilityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessibilityBtnActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  sosIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sosTextContainer: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sosSubtitle: {
    fontSize: 13,
    color: '#FEE2E2',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  medCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  medCardTaken: {
    opacity: 0.75,
    backgroundColor: '#F1F5F9',
  },
  pillColorBar: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medContent: {
    flex: 1,
    padding: 16,
  },
  medTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  cardVoiceBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  dosageText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  medFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeTagText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealTagText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
  },
  cardActionsContainer: {
    marginTop: 14,
  },
  missedNoticeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
  },
  missedNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  cardActions: {
    flexDirection: 'row',
  },
  takeDoseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  takeDoseBtnMissed: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
  },
  takeDoseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  statusBadgeTakenFull: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  statusTextTaken: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyCodeBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyCodeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
  },
  emptyCodeVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0D9488',
    letterSpacing: 2,
    marginBottom: 10,
  },
  emptyShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyShareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  addMedEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addMedEmptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  emptyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewPrescriptionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewPrescriptionsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});
