import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const AddMedicationModal = ({ visible, onClose }) => {
  const { addMedication } = useApp();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [mealCondition, setMealCondition] = useState('After Meal');
  const [color, setColor] = useState('#3B82F6');
  const [shape, setShape] = useState('circle');

  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter medication name.');
      return;
    }

    addMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 Tablet',
      time: time.trim() || '09:00 AM',
      mealCondition,
      color,
      shape,
    });

    // Reset & close
    setName('');
    setDosage('');
    onClose();
    Alert.alert('Success', 'Medication added and synced with Patient!');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Add New Medication</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Text style={styles.label}>Medicine Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Metformin, Aspirin"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1 Tablet (500mg)"
            value={dosage}
            onChangeText={setDosage}
          />

          <Text style={styles.label}>Schedule Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 08:30 AM"
            value={time}
            onChangeText={setTime}
          />

          <Text style={styles.label}>Meal Timing</Text>
          <View style={styles.optionRow}>
            {['Before Meal', 'After Meal', 'With Food'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.pillOption, mealCondition === item && styles.pillOptionActive]}
                onPress={() => setMealCondition(item)}
              >
                <Text style={[styles.pillOptionText, mealCondition === item && styles.pillOptionTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color Tagging for Elderly */}
          <Text style={styles.label}>Pill Color Tag (For Patient Recognition)</Text>
          <View style={styles.colorRow}>
            {colorOptions.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  color === c && styles.colorCircleSelected,
                ]}
                onPress={() => setColor(c)}
              >
                {color === c && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save & Sync with Patient</Text>
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
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
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  pillOptionActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  pillOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pillOptionTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
    marginVertical: 6,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
