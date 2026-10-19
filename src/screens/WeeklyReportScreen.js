import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { generateAndShareAdherenceReport } from '../services/pdfService';

export const WeeklyReportScreen = ({ onBack }) => {
  const { patients, selectedPatientId, medications, adherenceHistory, currentUser } = useApp();

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || (currentUser?.roles?.includes('PATIENT') ? {
    name: currentUser.name,
    code: currentUser.pairingCode,
    phone: currentUser.phone,
    age: currentUser.age || null,
  } : null);

  const patientMeds = currentPatient ? medications.filter(m => !m.patientId || m.patientId === currentPatient.id) : medications;

  const totalDoses = adherenceHistory.length;
  const takenDoses = adherenceHistory.filter(h => h.status === 'Taken').length;
  const missedDoses = adherenceHistory.filter(h => h.status === 'Missed').length;
  const rate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const handleExportPDF = () => {
    if (!currentPatient && patientMeds.length === 0) {
      alert('No patient data available to generate a report. Add a medicine or link a patient first.');
      return;
    }
    const reportPatient = currentPatient || {
      name: currentUser?.name || 'Patient',
      code: currentUser?.pairingCode || 'N/A',
      phone: currentUser?.phone || 'N/A',
      age: currentUser?.age || null,
    };
    generateAndShareAdherenceReport(reportPatient, patientMeds, adherenceHistory);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Weekly Compliance Report</Text>
      </View>

      {/* Main Stats Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Weekly Adherence Rate</Text>
        <Text style={styles.heroPercent}>{rate}%</Text>
        <Text style={styles.heroSub}>
          {rate >= 80 ? '🌟 Outstanding adherence this week!' : '⚠️ Needs closer caretaker supervision.'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{takenDoses}</Text>
            <Text style={styles.statName}>Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#EF4444' }]}>{missedDoses}</Text>
            <Text style={styles.statName}>Missed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalDoses}</Text>
            <Text style={styles.statName}>Scheduled</Text>
          </View>
        </View>
      </View>

      {/* DOWNLOAD / SHARE PDF REPORT BUTTON */}
      <TouchableOpacity 
        style={styles.pdfBtn}
        onPress={handleExportPDF}
      >
        <Ionicons name="cloud-download-outline" size={22} color="#FFFFFF" />
        <Text style={styles.pdfBtnText}>Export Doctor-Ready PDF Report</Text>
      </TouchableOpacity>

      {/* History Log */}
      <Text style={styles.historyHeading}>7-Day Adherence Log</Text>
      {adherenceHistory.length > 0 ? (
        adherenceHistory.map((item, idx) => (
          <View key={idx} style={styles.historyItem}>
            <View style={[
              styles.historyIconCircle, 
              { backgroundColor: item.status === 'Taken' ? '#DCFCE7' : '#FEE2E2' }
            ]}>
              <Ionicons 
                name={item.status === 'Taken' ? 'checkmark' : 'close'} 
                size={18} 
                color={item.status === 'Taken' ? '#166534' : '#991B1B'} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyPillName}>{item.pillName}</Text>
              <Text style={styles.historyDate}>{item.date} • {item.time}</Text>
            </View>
            <Text style={[
              styles.historyStatusText, 
              { color: item.status === 'Taken' ? '#16A34A' : '#DC2626' }
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        ))
      ) : (
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>No Adherence Records Yet</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>
            Logs will be recorded automatically when medications are marked as Taken or Missed.
          </Text>
        </View>
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroCard: {
    backgroundColor: '#0D9488',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  heroLabel: {
    color: '#CCFBF1',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroPercent: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    marginVertical: 4,
  },
  heroSub: {
    color: '#F0FDFA',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statName: {
    fontSize: 12,
    color: '#CCFBF1',
    marginTop: 2,
    fontWeight: '600',
  },
  pdfBtn: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 10,
  },
  pdfBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  historyHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  historyItem: {
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
  historyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyPillName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
