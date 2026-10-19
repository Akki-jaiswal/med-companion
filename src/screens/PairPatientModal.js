import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const PairPatientModal = ({ visible, onClose }) => {
  const { pairPatientByCode } = useApp();

  const [code, setCode] = useState('');
  const [relation, setRelation] = useState('Doctor');
  const [customRelation, setCustomRelation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relations = ['Doctor', 'Father', 'Mother', 'Spouse', 'Grandparent', 'Child', 'Guardian', 'Other'];

  const handlePair = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Required Field', "Please enter the patient's 6-digit App Code (e.g. MED-1186).");
      return;
    }

    const finalRelation = relation === 'Other' && customRelation.trim() 
      ? customRelation.trim() 
      : relation;

    setIsSubmitting(true);
    try {
      const res = await pairPatientByCode(cleanCode, finalRelation);
      setIsSubmitting(false);

      if (!res.success) {
        Alert.alert('Patient Not Found', res.error);
        return;
      }

      // Success!
      setCode('');
      setCustomRelation('');
      onClose();
      Alert.alert(
        'Patient Linked Successfully!',
        `${res.patient.name} (Age: ${res.patient.age || 'N/A'}, Code: ${res.patient.code}) has been connected to your Caretaker Dashboard as your ${finalRelation}.`
      );
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Unable to link patient. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="link" size={20} color="#0D9488" />
              </View>
              <Text style={styles.modalTitle}>Link New Patient</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.subInfo}>
              Enter the patient's 6-digit App Code. Their registered name, age, phone number, and daily prescriptions will sync automatically.
            </Text>

            {/* MANDATORY / COMPULSORY 6-DIGIT CODE */}
            <Text style={styles.label}>Patient's 6-Digit App Code * (Compulsory)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#0D9488" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. MED-1186"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
                value={code}
                onChangeText={setCode}
              />
            </View>

            {/* MANDATORY RELATIONSHIP SELECTOR */}
            <Text style={styles.label}>Your Relationship to Patient *</Text>
            <View style={styles.relationGrid}>
              {relations.map((rel) => {
                const isSelected = relation === rel;
                return (
                  <TouchableOpacity
                    key={rel}
                    style={[styles.relPill, isSelected && styles.relPillActive]}
                    onPress={() => setRelation(rel)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.relText, isSelected && styles.relTextActive]}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {relation === 'Other' && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Specify Relationship</Text>
                <TextInput
                  style={styles.customRelInput}
                  placeholder="e.g. Nurse, Caregiver, Friend"
                  placeholderTextColor="#94A3B8"
                  value={customRelation}
                  onChangeText={setCustomRelation}
                />
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#0D9488" />
              <Text style={styles.infoText}>
                No need to type patient's name, age, or phone — they are securely pulled from the patient's registered profile.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.connectBtn, isSubmitting && { opacity: 0.6 }]} 
              onPress={handlePair}
              disabled={isSubmitting}
            >
              <Ionicons name="link-outline" size={20} color="#FFFFFF" />
              <Text style={styles.connectBtnText}>
                {isSubmitting ? 'Verifying Code...' : 'Link Patient to Dashboard'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subInfo: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  relPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  relPillActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  relText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  relTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  customRelInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0F766E',
    lineHeight: 16,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  connectBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
