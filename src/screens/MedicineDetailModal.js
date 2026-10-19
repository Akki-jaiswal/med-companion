import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { speakMedicationReminder, stopSpeech } from '../services/voiceService';

export const MedicineDetailModal = ({ visible, med, onClose, onMarkTaken }) => {
  const { currentUser } = useApp();
  if (!med) return null;

  const isTaken = med.statusToday === 'taken';
  const targetPatientName = med.patientName || currentUser?.name || 'Patient';

  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.topRow}>
            <Text style={styles.modalTag}>MEDICINE DETAILS</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Pill Visualizer Showcase */}
            <View style={styles.pillShowcase}>
              <View 
                style={[
                  styles.pillGraphic, 
                  { backgroundColor: med.color || '#3B82F6' },
                  med.shape === 'capsule' ? styles.capsuleShape : styles.circleShape
                ]}
              >
                <Ionicons 
                  name={med.shape === 'capsule' ? 'medical' : 'ellipse'} 
                  size={36} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={styles.pillNameText}>{med.name}</Text>
              <Text style={styles.pillDosageText}>💊 {med.dosage}</Text>
            </View>

            {/* Read Out Loud (Voice Assistant) Button */}
            <TouchableOpacity 
              style={styles.voiceBtn}
              onPress={() => speakMedicationReminder(med, targetPatientName)}
            >
              <Ionicons name="volume-high" size={22} color="#0D9488" />
              <Text style={styles.voiceBtnText}>Read Instructions Out Loud</Text>
            </TouchableOpacity>

            {/* Quick Badges */}
            <View style={styles.badgeGrid}>
              <View style={styles.badgeItem}>
                <Ionicons name="time" size={20} color="#0D9488" />
                <Text style={styles.badgeLabel}>SCHEDULE</Text>
                <Text style={styles.badgeValue}>{med.time}</Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="restaurant" size={20} color="#D97706" />
                <Text style={[styles.badgeLabel, { color: '#B45309' }]}>DIET TIMING</Text>
                <Text style={styles.badgeValue}>{med.mealCondition}</Text>
              </View>
            </View>

            {/* Doctor Instructions & Precautions */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📋 Medical Instructions</Text>
              <Text style={styles.infoBody}>
                • Take dose on time with a full glass of water.
                {'\n'}• Do not skip or double up on doses.
                {'\n'}• If you experience any dizziness, notify your caretaker immediately via the SOS button.
              </Text>
            </View>

            {/* Adherence Status */}
            <View style={styles.statusBox}>
              <Text style={styles.statusBoxLabel}>Today's Status:</Text>
              <Text style={[
                styles.statusBoxValue,
                isTaken ? { color: '#16A34A' } : { color: '#D97706' }
              ]}>
                {isTaken ? `✓ Taken at ${med.takenAt}` : '⏳ Pending Intake'}
              </Text>
            </View>

            {/* Actions */}
            {!isTaken ? (
              <TouchableOpacity 
                style={styles.takeBtn}
                onPress={() => {
                  onMarkTaken(med.id);
                  handleClose();
                }}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.takeBtnText}>Mark as Taken Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-done-circle" size={24} color="#166534" />
                <Text style={styles.completedBadgeText}>Medication Completed for Today</Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillShowcase: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  pillGraphic: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  circleShape: {
    borderRadius: 36,
  },
  capsuleShape: {
    width: 90,
    height: 48,
    borderRadius: 24,
  },
  pillNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  pillDosageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  voiceBtn: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  voiceBtnText: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '700',
  },
  badgeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  infoBody: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  statusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 20,
  },
  statusBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  statusBoxValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  takeBtn: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  takeBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  completedBadge: {
    flexDirection: 'row',
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedBadgeText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
  },
});
