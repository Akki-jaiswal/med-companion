import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const AddMedicationModal = ({ visible, onClose, medicationToEdit = null }) => {
  const { addMedication, updateMedication } = useApp();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [mealCondition, setMealCondition] = useState('After Meal');
  const [frequency, setFrequency] = useState('Daily');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [weeklyDay, setWeeklyDay] = useState('Mon');
  const [color, setColor] = useState('#3B82F6');
  const [shape, setShape] = useState('circle');

  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const timePresets = [
    { label: '⚡ Test in 1 Min', value: 'In 1 Minute' },
    { label: '🌅 Morning (08:00 AM)', value: '08:00 AM' },
    { label: '☀️ Afternoon (01:30 PM)', value: '01:30 PM' },
    { label: '🌙 Night (08:30 PM)', value: '08:30 PM' },
  ];

  const frequencyOptions = [
    { id: 'Daily', label: 'Every Day', icon: 'calendar-outline' },
    { id: 'Specific Days', label: 'Specific Days', icon: 'checkbox-outline' },
    { id: 'Weekly', label: 'Weekly', icon: 'repeat-outline' },
    { id: 'Alternate Days', label: 'Alternate Days', icon: 'swap-horizontal-outline' },
  ];

  useEffect(() => {
    if (medicationToEdit) {
      setName(medicationToEdit.name || '');
      setDosage(medicationToEdit.dosage || '');
      setTime(medicationToEdit.time || '08:00 AM');
      setMealCondition(medicationToEdit.mealCondition || 'After Meal');
      setFrequency(medicationToEdit.frequency || 'Daily');
      setSelectedDays(medicationToEdit.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      setWeeklyDay(medicationToEdit.weeklyDay || 'Mon');
      setColor(medicationToEdit.color || '#3B82F6');
      setShape(medicationToEdit.shape || 'circle');
    } else {
      setName('');
      setDosage('');
      setTime('08:00 AM');
      setMealCondition('After Meal');
      setFrequency('Daily');
      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      setWeeklyDay('Mon');
      setColor('#3B82F6');
      setShape('circle');
    }
  }, [medicationToEdit, visible]);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        Alert.alert('Minimum One Day', 'Please keep at least one day selected.');
        return;
      }
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the medication name.');
      return;
    }

    const payload = {
      name: name.trim(),
      dosage: dosage.trim() || '1 Tablet',
      time: time.trim() || '08:00 AM',
      mealCondition,
      frequency,
      selectedDays: frequency === 'Specific Days' ? selectedDays : allDays,
      weeklyDay: frequency === 'Weekly' ? weeklyDay : null,
      color,
      shape,
    };

    if (medicationToEdit) {
      await updateMedication({
        ...medicationToEdit,
        ...payload,
      });
      Alert.alert('Schedule Updated', `${name} updated successfully!`);
    } else {
      await addMedication(payload);
      Alert.alert('Prescription Saved', `${name} scheduled for ${time} (${frequency}) and synced!`);
    }

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name={medicationToEdit ? "create-outline" : "medkit-outline"} size={22} color="#0D9488" />
              </View>
              <Text style={styles.modalTitle}>
                {medicationToEdit ? 'Edit Medication' : 'Add New Medication'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Form Fields */}
            <Text style={styles.label}>Medicine Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Disprin, Metformin, Amlodipine"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Dosage</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1 Tablet (500mg)"
              placeholderTextColor="#94A3B8"
              value={dosage}
              onChangeText={setDosage}
            />

            {/* Calendar / Alarm Frequency Setup */}
            <Text style={styles.label}>Schedule Frequency (Calendar Setup) *</Text>
            <View style={styles.freqGrid}>
              {frequencyOptions.map((f) => {
                const isSelected = frequency === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.freqCard, isSelected && styles.freqCardActive]}
                    onPress={() => setFrequency(f.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={f.icon} 
                      size={18} 
                      color={isSelected ? '#0D9488' : '#64748B'} 
                    />
                    <Text style={[styles.freqCardText, isSelected && styles.freqCardTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* If Specific Days Selected -> Show 7-Day Picker */}
            {frequency === 'Specific Days' && (
              <View style={styles.daysContainer}>
                <Text style={styles.subLabel}>Select Days of the Week:</Text>
                <View style={styles.daysRow}>
                  {allDays.map((day) => {
                    const isDaySelected = selectedDays.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayPill, isDaySelected && styles.dayPillActive]}
                        onPress={() => toggleDay(day)}
                      >
                        <Text style={[styles.dayPillText, isDaySelected && styles.dayPillTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* If Weekly Selected -> Show Single Day Picker */}
            {frequency === 'Weekly' && (
              <View style={styles.daysContainer}>
                <Text style={styles.subLabel}>Repeat Every Week on:</Text>
                <View style={styles.daysRow}>
                  {allDays.map((day) => {
                    const isWeeklyActive = weeklyDay === day;
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayPill, isWeeklyActive && styles.dayPillActive]}
                        onPress={() => setWeeklyDay(day)}
                      >
                        <Text style={[styles.dayPillText, isWeeklyActive && styles.dayPillTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <Text style={styles.label}>Alarm Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 08:30 AM"
              placeholderTextColor="#94A3B8"
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
              {['Before Meal', 'After Meal', 'With Food', 'Empty Stomach'].map((item) => (
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
            <Text style={styles.label}>Pill Shape & Color Indicator</Text>
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
              <Text style={styles.saveBtnText}>
                {medicationToEdit ? 'Save Changes' : 'Schedule Medication'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '92%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
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
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  freqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqCard: {
    flexBasis: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  freqCardActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  freqCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  freqCardTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  daysContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  presetBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  presetBadgeActive: {
    backgroundColor: '#0D9488',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOption: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillOptionActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  pillOptionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
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
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginTop: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    marginTop: 24,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
