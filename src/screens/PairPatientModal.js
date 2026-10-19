import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const PairPatientModal = ({ visible, onClose }) => {
  const { addPatient, pairPatientByCode } = useApp();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Family');

  const relations = ['Father', 'Mother', 'Spouse', 'Grandparent', 'Child', 'Other'];

  const handlePair = async () => {
    // If linking directly by 6-digit code:
    if (code.trim()) {
      await pairPatientByCode(code.trim().toUpperCase(), name.trim() || 'Monitored Patient');
      setCode('');
      setName('');
      onClose();
      Alert.alert('Patient Linked!', `Patient code ${code.trim().toUpperCase()} linked to your Caretaker Dashboard.`);
      return;
    }

    if (!name.trim()) {
      Alert.alert('Required', 'Please enter patient name or their 6-digit code.');
      return;
    }

    addPatient({
      name: name.trim(),
      age: parseInt(age, 10) || 65,
      phone: phone.trim(),
      relation,
    });

    // Reset & close
    setCode('');
    setName('');
    setAge('');
    setPhone('');
    onClose();
    Alert.alert('Patient Linked!', `${name} is now connected to your Caretaker Dashboard.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Link New Patient</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subInfo}>
            Enter the patient's 6-digit App Code (MED-XXXX) or add their details manually to monitor their daily medications remotely.
          </Text>

          {/* Code Link Box */}
          <Text style={styles.label}>Patient's 6-Digit Code (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. MED-7821"
            autoCapitalize="characters"
            value={code}
            onChangeText={setCode}
          />

          {/* Manual Details Form */}
          <Text style={styles.label}>Patient Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Enter patient name"
            value={name}
            onChangeText={setName}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Emergency Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <Text style={styles.label}>Relationship</Text>
          <View style={styles.relationRow}>
            {relations.map((rel) => (
              <TouchableOpacity
                key={rel}
                style={[styles.relPill, relation === rel && styles.relPillActive]}
                onPress={() => setRelation(rel)}
              >
                <Text style={[styles.relText, relation === rel && styles.relTextActive]}>
                  {rel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Connect Button */}
          <TouchableOpacity style={styles.connectBtn} onPress={handlePair}>
            <Ionicons name="link-outline" size={20} color="#FFFFFF" />
            <Text style={styles.connectBtnText}>Link Patient to Dashboard</Text>
          </TouchableOpacity>
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
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subInfo: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  relationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  relPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  relPillActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  relText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  relTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  connectBtn: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 8,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
