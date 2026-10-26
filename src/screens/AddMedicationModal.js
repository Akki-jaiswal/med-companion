import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ITEM_HEIGHT = 48;

export const AddMedicationModal = ({ visible, onClose, medicationToEdit = null, patientId = null }) => {
  const { addMedication, updateMedication, selectedPatientId, currentUser } = useApp();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [mealCondition, setMealCondition] = useState('After Meal');
  const [frequency, setFrequency] = useState('Daily');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [weeklyDay, setWeeklyDay] = useState('Mon');
  const [color, setColor] = useState('#3B82F6');
  const [shape, setShape] = useState('circle');

  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const periodScrollRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);
  const programmaticTimeoutRef = useRef(null);
  const hourRef = useRef('08');
  const minuteRef = useRef('00');
  const periodRef = useRef('AM');

  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periodsList = ['am', 'pm'];

  const frequencyOptions = [
    { id: 'Daily', label: 'Every Day', icon: 'calendar-outline' },
    { id: 'Specific Days', label: 'Specific Days', icon: 'checkbox-outline' },
    { id: 'Weekly', label: 'Weekly', icon: 'repeat-outline' },
    { id: 'Alternate Days', label: 'Alternate Days', icon: 'swap-horizontal-outline' },
  ];

  const timePresets = [
    { label: '⚡ Test in 1 Min', value: 'In 1 Minute' },
    { label: '🌅 Morning (08:00 AM)', value: '08:00 AM' },
    { label: '☀️ Afternoon (01:30 PM)', value: '01:30 PM' },
    { label: '🌙 Night (08:30 PM)', value: '08:30 PM' },
  ];

  const parseTimeString = (tStr) => {
    if (!tStr) return { hour: '08', minute: '00', period: 'AM' };
    const match = tStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = match[2];
      let p = (match[3] || 'AM').toUpperCase();
      return {
        hour: h.toString().padStart(2, '0'),
        minute: m.padStart(2, '0'),
        period: p,
      };
    }
    return { hour: '08', minute: '00', period: 'AM' };
  };

  const scrollToCurrentTime = (h, m, p, animated = true) => {
    const hIdx = hoursList.indexOf(h);
    if (hIdx >= 0) {
      hourScrollRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated });
    }
    const mIdx = minutesList.indexOf(m);
    if (mIdx >= 0) {
      minuteScrollRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated });
    }
    const pIdx = periodsList.findIndex(item => item.toUpperCase() === p.toUpperCase());
    if (pIdx >= 0) {
      periodScrollRef.current?.scrollTo({ y: pIdx * ITEM_HEIGHT, animated });
    }
  };

  const applyTime = (h, m, p, syncScroll = true) => {
    hourRef.current = h;
    minuteRef.current = m;
    periodRef.current = p;
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
    setTime(`${h}:${m} ${p}`);
    if (syncScroll) {
      if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
      isScrollingProgrammatically.current = true;
      scrollToCurrentTime(h, m, p, true);
      programmaticTimeoutRef.current = setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 400);
    }
  };

  const handleRealtimeScroll = (e, type) => {
    if (isScrollingProgrammatically.current) return;
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.round(y / ITEM_HEIGHT));
    if (type === 'hour') {
      const safeIdx = Math.min(hoursList.length - 1, idx);
      const h = hoursList[safeIdx];
      if (h && h !== hourRef.current) {
        hourRef.current = h;
        setSelectedHour(h);
        setTime(`${h}:${minuteRef.current} ${periodRef.current}`);
      }
    } else if (type === 'minute') {
      const safeIdx = Math.min(minutesList.length - 1, idx);
      const m = minutesList[safeIdx];
      if (m && m !== minuteRef.current) {
        minuteRef.current = m;
        setSelectedMinute(m);
        setTime(`${hourRef.current}:${m} ${periodRef.current}`);
      }
    } else if (type === 'period') {
      const safeIdx = Math.min(periodsList.length - 1, idx);
      const p = periodsList[safeIdx]?.toUpperCase();
      if (p && p !== periodRef.current) {
        periodRef.current = p;
        setSelectedPeriod(p);
        setTime(`${hourRef.current}:${minuteRef.current} ${p}`);
      }
    }
  };

  const handleScrollEnd = (e, type) => {
    if (isScrollingProgrammatically.current) return;
    const y = e.nativeEvent.contentOffset.y;
    if (type === 'hour') {
      const idx = Math.max(0, Math.min(hoursList.length - 1, Math.round(y / ITEM_HEIGHT)));
      const h = hoursList[idx];
      if (h) {
        hourRef.current = h;
        setSelectedHour(h);
        setTime(`${h}:${minuteRef.current} ${periodRef.current}`);
      }
    } else if (type === 'minute') {
      const idx = Math.max(0, Math.min(minutesList.length - 1, Math.round(y / ITEM_HEIGHT)));
      const m = minutesList[idx];
      if (m) {
        minuteRef.current = m;
        setSelectedMinute(m);
        setTime(`${hourRef.current}:${m} ${periodRef.current}`);
      }
    } else if (type === 'period') {
      const idx = Math.max(0, Math.min(periodsList.length - 1, Math.round(y / ITEM_HEIGHT)));
      const p = periodsList[idx]?.toUpperCase();
      if (p) {
        periodRef.current = p;
        setSelectedPeriod(p);
        setTime(`${hourRef.current}:${minuteRef.current} ${p}`);
      }
    }
  };

  const selectHourItem = (h, idx) => {
    hourRef.current = h;
    setSelectedHour(h);
    setTime(`${h}:${minuteRef.current} ${periodRef.current}`);
    if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
    isScrollingProgrammatically.current = true;
    hourScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    programmaticTimeoutRef.current = setTimeout(() => { isScrollingProgrammatically.current = false; }, 350);
  };

  const selectMinuteItem = (m, idx) => {
    minuteRef.current = m;
    setSelectedMinute(m);
    setTime(`${hourRef.current}:${m} ${periodRef.current}`);
    if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
    isScrollingProgrammatically.current = true;
    minuteScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    programmaticTimeoutRef.current = setTimeout(() => { isScrollingProgrammatically.current = false; }, 350);
  };

  const selectPeriodItem = (p, idx) => {
    const pUpper = p.toUpperCase();
    periodRef.current = pUpper;
    setSelectedPeriod(pUpper);
    setTime(`${hourRef.current}:${minuteRef.current} ${pUpper}`);
    if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
    isScrollingProgrammatically.current = true;
    periodScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    programmaticTimeoutRef.current = setTimeout(() => { isScrollingProgrammatically.current = false; }, 350);
  };

  const setTestIn1Min = () => {
    const d = new Date(Date.now() + 65 * 1000);
    let h = d.getHours();
    const m = d.getMinutes();
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    applyTime(hStr, mStr, p, true);
  };

  const handlePresetSelect = (preset) => {
    if (preset.value === 'In 1 Minute') {
      setTestIn1Min();
    } else {
      const parsed = parseTimeString(preset.value);
      applyTime(parsed.hour, parsed.minute, parsed.period, true);
    }
  };

  useEffect(() => {
    if (visible) {
      if (medicationToEdit) {
        setName(medicationToEdit.name || '');
        setDosage(medicationToEdit.dosage || '');
        const parsed = parseTimeString(medicationToEdit.time || '08:00 AM');
        hourRef.current = parsed.hour;
        minuteRef.current = parsed.minute;
        periodRef.current = parsed.period;
        setSelectedHour(parsed.hour);
        setSelectedMinute(parsed.minute);
        setSelectedPeriod(parsed.period);
        setTime(`${parsed.hour}:${parsed.minute} ${parsed.period}`);
        setMealCondition(medicationToEdit.mealCondition || 'After Meal');
        setFrequency(medicationToEdit.frequency || 'Daily');
        setSelectedDays(medicationToEdit.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        setWeeklyDay(medicationToEdit.weeklyDay || 'Mon');
        setColor(medicationToEdit.color || '#3B82F6');
        setShape(medicationToEdit.shape || 'circle');
        
        if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
        isScrollingProgrammatically.current = true;
        setTimeout(() => {
          scrollToCurrentTime(parsed.hour, parsed.minute, parsed.period, false);
          programmaticTimeoutRef.current = setTimeout(() => {
            isScrollingProgrammatically.current = false;
          }, 150);
        }, 100);
      } else {
        setName('');
        setDosage('');
        hourRef.current = '08';
        minuteRef.current = '00';
        periodRef.current = 'AM';
        setSelectedHour('08');
        setSelectedMinute('00');
        setSelectedPeriod('AM');
        setTime('08:00 AM');
        setMealCondition('After Meal');
        setFrequency('Daily');
        setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        setWeeklyDay('Mon');
        setColor('#3B82F6');
        setShape('circle');

        if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
        isScrollingProgrammatically.current = true;
        setTimeout(() => {
          scrollToCurrentTime('08', '00', 'AM', false);
          programmaticTimeoutRef.current = setTimeout(() => {
            isScrollingProgrammatically.current = false;
          }, 150);
        }, 100);
      }
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
      patientId: patientId || medicationToEdit?.patientId || (currentUser?.roles?.includes('CARETAKER') ? selectedPatientId : (currentUser?.id || 'self')),
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody} nestedScrollEnabled={true}>
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

            {/* ALARM TIME VERTICAL WHEEL DRUM PICKER (MATCHING NATIVE MOBILE ALARM) */}
            <View style={styles.timeSectionBox}>
              <View style={styles.timeSectionHeaderRow}>
                <Ionicons name="alarm-outline" size={18} color="#0D9488" />
                <Text style={styles.timeSectionTitle}>Alarm Time</Text>
              </View>

              {/* Native Mobile Dark Drum Wheel (Hours : Minutes am/pm) */}
              <View style={styles.wheelDrumCard}>
                {/* Horizontal Center Highlight Overlay */}
                <View style={styles.wheelCenterHighlight} />

                {/* 1. Hour Drum */}
                <View style={styles.wheelColumnContainer}>
                  <ScrollView
                    ref={hourScrollRef}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    onScroll={(e) => handleRealtimeScroll(e, 'hour')}
                    snapToInterval={ITEM_HEIGHT}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => handleScrollEnd(e, 'hour')}
                    onScrollEndDrag={(e) => handleScrollEnd(e, 'hour')}
                    contentContainerStyle={styles.wheelScrollContent}
                  >
                    {hoursList.map((h, idx) => {
                      const isSelected = selectedHour === h;
                      return (
                        <TouchableOpacity
                          key={h}
                          style={styles.wheelItem}
                          onPress={() => selectHourItem(h, idx)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextActive]}>
                            {parseInt(h, 10)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Center Colon Separator */}
                <Text style={styles.wheelColon}>:</Text>

                {/* 2. Minute Drum */}
                <View style={styles.wheelColumnContainer}>
                  <ScrollView
                    ref={minuteScrollRef}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    onScroll={(e) => handleRealtimeScroll(e, 'minute')}
                    snapToInterval={ITEM_HEIGHT}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => handleScrollEnd(e, 'minute')}
                    onScrollEndDrag={(e) => handleScrollEnd(e, 'minute')}
                    contentContainerStyle={styles.wheelScrollContent}
                  >
                    {minutesList.map((m, idx) => {
                      const isSelected = selectedMinute === m;
                      return (
                        <TouchableOpacity
                          key={m}
                          style={styles.wheelItem}
                          onPress={() => selectMinuteItem(m, idx)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextActive]}>
                            {m}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 3. AM / PM Drum */}
                <View style={styles.wheelColumnContainer}>
                  <ScrollView
                    ref={periodScrollRef}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    onScroll={(e) => handleRealtimeScroll(e, 'period')}
                    snapToInterval={ITEM_HEIGHT}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => handleScrollEnd(e, 'period')}
                    onScrollEndDrag={(e) => handleScrollEnd(e, 'period')}
                    contentContainerStyle={styles.wheelScrollContent}
                  >
                    {periodsList.map((p, idx) => {
                      const isSelected = selectedPeriod.toUpperCase() === p.toUpperCase();
                      return (
                        <TouchableOpacity
                          key={p}
                          style={styles.wheelItem}
                          onPress={() => selectPeriodItem(p, idx)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.wheelPeriodText, isSelected && styles.wheelPeriodTextActive]}>
                            {p}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* Quick Presets row including "⚡ Test in 1 Min" */}
              <View style={styles.presetsRow}>
                <TouchableOpacity
                  style={styles.testQuickBtn}
                  onPress={setTestIn1Min}
                  activeOpacity={0.7}
                >
                  <Ionicons name="flash" size={13} color="#64748B" />
                  <Text style={styles.testQuickBtnText}>Test in 1 Min</Text>
                </TouchableOpacity>

                {timePresets.filter(p => p.value !== 'In 1 Minute').map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.presetBadge, 
                      time === preset.value && styles.presetBadgeActive
                    ]}
                    onPress={() => handlePresetSelect(preset)}
                  >
                    <Text style={[
                      styles.presetText, 
                      time === preset.value && styles.presetTextActive
                    ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
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
  timeSectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 14,
    marginBottom: 6,
  },
  timeSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  wheelDrumCard: {
    backgroundColor: '#0A0F1D',
    borderRadius: 20,
    height: 144, // ITEM_HEIGHT * 3 (shows 3 rows: upper dimmed, center active, lower dimmed)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  wheelCenterHighlight: {
    position: 'absolute',
    top: 48, // ITEM_HEIGHT
    left: 12,
    right: 12,
    height: 48, // ITEM_HEIGHT
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    pointerEvents: 'none',
  },
  wheelColumnContainer: {
    flex: 1,
    height: 144,
  },
  wheelScrollContent: {
    paddingVertical: 48, // ITEM_HEIGHT padding so first and last items snap perfectly to center
    alignItems: 'center',
  },
  wheelItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#475569',
  },
  wheelItemTextActive: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  wheelColon: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginHorizontal: 4,
    lineHeight: 48,
  },
  wheelPeriodText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'lowercase',
  },
  wheelPeriodTextActive: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'lowercase',
  },
  testQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  testQuickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});
