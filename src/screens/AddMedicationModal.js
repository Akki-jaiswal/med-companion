import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const AddMedicationModal = ({ visible, onClose }) => {
  const { addMedication } = useApp();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [mealCondition, setMealCondition] = useState('After Meal');
  const [color, setColor] = useState('#3B82F6');
  const [shape, setShape] = useState('circle');

  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  const timePresets = [
    { label: '⚡ Test in 1 Min', value: 'In 1 Minute' },
    { label: '🌅 Morning (08:00 AM)', value: '08:00 AM' },
    { label: '☀️ Afternoon (01:30 PM)', value: '01:30 PM' },
    { label: '🌙 Night (08:30 PM)', value: '08:30 PM' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter medication name.');
      return;
    }

    addMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 Tablet',
      time: time.trim() || '08:00 AM',
      mealCondition,
      color,
      shape,
    });

    // Reset & close
    setName('');
    setDosage('');
    onClose();
    Alert.alert('Prescription Saved', `${name} scheduled for ${time} and synced with patient!`);
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

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Form */}
            <Text style={styles.label}>Medicine Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Metformin, Amlodipine"
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

            {/* Quick Time Presets */}
            <View style={styles.presetsRow}>
              {timePresets.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[styles.presetBadge, time === preset.value && styles.presetBadgeActive]}
                  onPress={() => setTime(preset.value)}
                >
                  <Text style={[styles.presetText, time === preset.value && styles.presetTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

            {/* Pill Shape & Color Tagging for Elderly */}
            <Text style={styles.label}>Pill Shape & Color Tag</Text>
            <View style={styles.shapeRow}>
              <TouchableOpacity
                style={[styles.shapeBtn, shape === 'circle' && styles.shapeBtnActive]}
                onPress={() => setShape('circle')}
              >
                <Ionicons name="ellipse" size={20} color={shape === 'circle' ? '#0D9488' : '#64748B'} />
                <Text style={styles.shapeText}>Round Tablet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shapeBtn, shape === 'capsule' && styles.shapeBtnActive]}
                onPress={() => setShape('capsule')}
              >
                <Ionicons name="medical" size={20} color={shape === 'capsule' ? '#0D9488' : '#64748B'} />
                <Text style={styles.shapeText}>Capsule</Text>
              </TouchableOpacity>
            </View>

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
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 12,
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
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  presetBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetBadgeActive: {
    backgroundColor: '#CCFBF1',
    borderColor: '#0D9488',
  },
  presetText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#0F766E',
    fontWeight: '700',
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
  shapeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  shapeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  shapeBtnActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  shapeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
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
    marginTop: 22,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
