import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const PairPatientModal = ({ visible, onClose }) => {
  const { addPatient } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('+91');
  const [relation, setRelation] = useState('Father');

  const relations = ['Father', 'Mother', 'Grandfather', 'Grandmother', 'Other'];

  const handlePair = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter patient name.');
      return;
    }

    addPatient({
      name: name.trim(),
      age: parseInt(age) || 65,
      phone: phone.trim() || '+919876543210',
      relation,
    });

    // Reset & close
    setName('');
    setAge('');
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
            Enter patient details or their 6-digit App Code to monitor their daily medications remotely.
          </Text>

          {/* Form */}
          <Text style={styles.label}>Patient Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Grandma (Mary)"
            value={name}
            onChangeText={setName}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 72"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Emergency Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
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
