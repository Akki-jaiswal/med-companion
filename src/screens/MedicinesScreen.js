import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { speakMedicationReminder } from '../services/voiceService';
import { AddMedicationModal } from './AddMedicationModal';
import { MedicineDetailModal } from './MedicineDetailModal';

export const MedicinesScreen = () => {
  const { currentUser, medications, deleteMedication, markAsTaken } = useApp();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [detailMed, setDetailMed] = useState(null);

  const patientDisplayName = currentUser?.name || 'Patient';

  // Filter medications belonging to this patient
  const patientMeds = medications.filter(m => 
    !m.patientId || 
    m.patientId === 'self' || 
    m.patientId === currentUser?.id || 
    m.patientId === currentUser?.pairingCode
  );

  const handleDelete = (med) => {
    Alert.alert(
      'Delete Prescription',
      `Are you sure you want to delete ${med.name}? Its alarms and scheduled notifications will be cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await deleteMedication(med.id);
            Alert.alert('Deleted', `${med.name} has been removed from your prescriptions.`);
          } 
        }
      ]
    );
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setAddModalVisible(true);
  };

  const handleOpenAdd = () => {
    setEditingMed(null);
    setAddModalVisible(true);
  };

  const formatScheduleText = (med) => {
    if (!med.frequency || med.frequency === 'Daily') return '📅 Every Day';
    if (med.frequency === 'Weekly') return `📅 Weekly (${med.weeklyDay || 'Mon'})`;
    if (med.frequency === 'Specific Days') {
      if (!med.selectedDays || med.selectedDays.length === 7) return '📅 Every Day';
      return `📅 ${med.selectedDays.join(', ')}`;
    }
    if (med.frequency === 'Alternate Days') return '📅 Alternate Days';
    return `📅 ${med.frequency}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.subtitle}>MEDICATION MANAGEMENT</Text>
            <Text style={styles.title}>My Prescriptions</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtnHeader} 
            onPress={handleOpenAdd}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnHeaderText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="alarm-outline" size={22} color="#0D9488" />
          <Text style={styles.infoBannerText}>
            You have <Text style={{ fontWeight: 'bold' }}>{patientMeds.length}</Text> active prescription{patientMeds.length === 1 ? '' : 's'}. You can add, edit times, customize calendar frequencies, or remove medications anytime.
          </Text>
        </View>

        {/* Empty State */}
        {patientMeds.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="medkit-outline" size={48} color="#0D9488" />
            </View>
            <Text style={styles.emptyTitle}>No Prescriptions Added</Text>
            <Text style={styles.emptySub}>
              Keep all your daily medicines, dosages, and alarm times organized here.
            </Text>
            <TouchableOpacity 
              style={styles.emptyAddBtn}
              onPress={handleOpenAdd}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Add Your First Medicine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          patientMeds.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medTopRow}>
                <View style={[styles.pillColorStrip, { backgroundColor: med.color || '#3B82F6' }]}>
                  <Ionicons 
                    name={med.shape === 'capsule' ? 'medical' : 'ellipse'} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>💊 {med.dosage}</Text>
                </View>

                {/* Speak button */}
                <TouchableOpacity 
                  style={styles.voiceBtn}
                  onPress={() => speakMedicationReminder(med, patientDisplayName)}
                >
                  <Ionicons name="volume-high" size={18} color="#0D9488" />
                </TouchableOpacity>
              </View>

              {/* Schedule Info Chips */}
              <View style={styles.chipsRow}>
                <View style={styles.chip}>
                  <Ionicons name="time-outline" size={14} color="#0D9488" />
                  <Text style={styles.chipText}>{med.time}</Text>
                </View>

                <View style={styles.chip}>
                  <Ionicons name="restaurant-outline" size={14} color="#B45309" />
                  <Text style={[styles.chipText, { color: '#B45309' }]}>{med.mealCondition}</Text>
                </View>

                <View style={[styles.chip, { backgroundColor: '#F0FDFA' }]}>
                  <Text style={[styles.chipText, { color: '#0F766E', fontWeight: '700' }]}>
                    {formatScheduleText(med)}
                  </Text>
                </View>
              </View>

              {/* Card Action Controls: Edit, Detail, Delete */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity 
                  style={styles.actionBtnOutline}
                  onPress={() => setDetailMed(med)}
                >
                  <Ionicons name="eye-outline" size={16} color="#0F172A" />
                  <Text style={styles.actionBtnOutlineText}>Details</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtnOutline}
                  onPress={() => handleEdit(med)}
                >
                  <Ionicons name="create-outline" size={16} color="#0D9488" />
                  <Text style={[styles.actionBtnOutlineText, { color: '#0D9488' }]}>Edit Time</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(med)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add / Edit Medication Modal */}
      <AddMedicationModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingMed(null);
        }}
        medicationToEdit={editingMed}
      />

      {/* Detail Showcase Modal */}
      {detailMed && (
        <MedicineDetailModal
          visible={!!detailMed}
          med={detailMed}
          onClose={() => setDetailMed(null)}
          onMarkTaken={markAsTaken}
        />
      )}
    </View>
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
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  addBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  addBtnHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#0F766E',
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillColorStrip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  medDosage: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  voiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 10,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
});
