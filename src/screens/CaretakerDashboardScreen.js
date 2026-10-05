import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { callCaretaker } from '../services/emergencyService';
import { AddMedicationModal } from './AddMedicationModal';
import { PairPatientModal } from './PairPatientModal';

export const CaretakerDashboardScreen = ({ onNavigateReport }) => {
  const { 
    patients, 
    selectedPatientId, 
    setSelectedPatientId, 
    medications,
    escalationAlert,
    setEscalationAlert,
    adherenceHistory
  } = useApp();

  const [addMedModalVisible, setAddMedModalVisible] = useState(false);
  const [pairModalVisible, setPairModalVisible] = useState(false);

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientMeds = medications.filter(m => m.patientId === currentPatient.id);

  // Stats calculation
  const totalDoses = adherenceHistory.length;
  const takenDoses = adherenceHistory.filter(h => h.status === 'Taken').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>CARETAKER DASHBOARD</Text>
          <Text style={styles.headerTitle}>All Monitored Patients</Text>
        </View>
        <TouchableOpacity 
          style={styles.addPatientBtn}
          onPress={() => setPairModalVisible(true)}
        >
          <Ionicons name="person-add" size={18} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Patients Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientTabs}>
        {patients.map((p) => {
          const isSelected = p.id === currentPatient.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.patientTabItem, isSelected && styles.patientTabItemActive]}
              onPress={() => setSelectedPatientId(p.id)}
            >
              <Ionicons 
                name="person-circle" 
                size={22} 
                color={isSelected ? '#FFFFFF' : '#0D9488'} 
              />
              <Text style={[styles.patientTabText, isSelected && styles.patientTabTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 🚨 ESCALATION ALERT BANNER (If patient misses alarm) */}
      {escalationAlert && (
        <View style={styles.escalationCard}>
          <View style={styles.escalationHeader}>
            <Ionicons name="warning" size={26} color="#DC2626" />
            <Text style={styles.escalationTitle}>🚨 MEDICATION MISSED ALERT</Text>
          </View>
          <Text style={styles.escalationMessage}>
            {escalationAlert.patientName} did not take <Text style={{ fontWeight: 'bold' }}>{escalationAlert.pillName}</Text> scheduled at {escalationAlert.scheduledTime}.
          </Text>
          
          <View style={styles.escalationActions}>
            <TouchableOpacity 
              style={styles.callNowBtn}
              onPress={() => callCaretaker(currentPatient.phone)}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
              <Text style={styles.callNowBtnText}>Call Patient Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dismissBtn}
              onPress={() => setEscalationAlert(null)}
            >
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Patient Card & Actions */}
      <View style={styles.patientProfileCard}>
        <View style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={28} color="#0D9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{currentPatient.name}</Text>
            <Text style={styles.profileSub}>Age: {currentPatient.age} yrs • Pairing Code: <Text style={{ fontWeight: 'bold', color: '#0D9488' }}>{currentPatient.code}</Text></Text>
          </View>
          
          {/* Quick Direct Call Button */}
          <TouchableOpacity 
            style={styles.directCallCircle}
            onPress={() => callCaretaker(currentPatient.phone)}
          >
            <Ionicons name="call" size={20} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* Adherence Rate Mini-Bar */}
        <View style={styles.adherenceMiniCard}>
          <View style={styles.adherenceMiniHeader}>
            <Text style={styles.adherenceRateText}>{adherenceRate}% Compliance</Text>
            <Text style={styles.adherenceSubText}>Past 7 Days</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${adherenceRate}%` }]} />
          </View>
        </View>

        {/* 3 Main Action Buttons from Flowchart */}
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionGridBtn}
            onPress={() => setAddMedModalVisible(true)}
          >
            <Ionicons name="add-circle" size={22} color="#0D9488" />
            <Text style={styles.actionGridText}>Add Medicine</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionGridBtn}
            onPress={onNavigateReport}
          >
            <Ionicons name="document-text" size={22} color="#0D9488" />
            <Text style={styles.actionGridText}>Weekly Report</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionGridBtn}
            onPress={() => callCaretaker(currentPatient.phone)}
          >
            <Ionicons name="call" size={22} color="#0D9488" />
            <Text style={styles.actionGridText}>Call Patient</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prescriptions List */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeading}>Patient Prescriptions</Text>
        <Text style={styles.countBadge}>{patientMeds.length} active</Text>
      </View>

      {patientMeds.map((med) => (
        <View key={med.id} style={styles.medItemCard}>
          <View style={[styles.pillColorDot, { backgroundColor: med.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.medItemTitle}>{med.name}</Text>
            <Text style={styles.medItemDetail}>{med.dosage} • {med.time}</Text>
            <Text style={styles.medItemMeal}>🍽️ {med.mealCondition}</Text>
          </View>
          <View style={[
            styles.statusTag, 
            med.statusToday === 'taken' ? styles.statusTagTaken : styles.statusTagPending
          ]}>
            <Text style={[
              styles.statusTagText,
              med.statusToday === 'taken' ? styles.statusTagTextTaken : styles.statusTagTextPending
            ]}>
              {med.statusToday === 'taken' ? '✓ Taken' : '⏰ Pending'}
            </Text>
          </View>
        </View>
      ))}

      {/* Modals */}
      <AddMedicationModal visible={addMedModalVisible} onClose={() => setAddMedModalVisible(false)} />
      <PairPatientModal visible={pairModalVisible} onClose={() => setPairModalVisible(false)} />

      <View style={{ height: 40 }} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  addPatientBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientTabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  patientTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    gap: 8,
  },
  patientTabItemActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  patientTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  patientTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  escalationCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  escalationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  escalationTitle: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '800',
  },
  escalationMessage: {
    color: '#7F1D1D',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  escalationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  callNowBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  callNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dismissBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  patientProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  directCallCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adherenceMiniCard: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  adherenceMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adherenceRateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  adherenceSubText: {
    fontSize: 12,
    color: '#64748B',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#0D9488',
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },
  actionGridBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  actionGridText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  medItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 12,
  },
  pillColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  medItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  medItemDetail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  medItemMeal: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 4,
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagTaken: {
    backgroundColor: '#DCFCE7',
  },
  statusTagPending: {
    backgroundColor: '#FEF3C7',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTagTextTaken: {
    color: '#166534',
  },
  statusTagTextPending: {
    color: '#92400E',
  },
});
