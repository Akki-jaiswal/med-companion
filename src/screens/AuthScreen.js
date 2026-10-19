import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const AuthScreen = ({ onClose }) => {
  const { loginUser, registerUser } = useApp();

  const [isSignUp, setIsSignUp] = useState(true);

  // How user wants to register: Patient, Caretaker, or Both!
  const [isPatientSelected, setIsPatientSelected] = useState(true);
  const [isCaretakerSelected, setIsCaretakerSelected] = useState(false);

  // Common user fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient required fields
  const [emergencyCaretakerPhone, setEmergencyCaretakerPhone] = useState('');
  const [age, setAge] = useState('');

  // Caretaker required fields
  const [relation, setRelation] = useState('');
  const [patientCodeToLink, setPatientCodeToLink] = useState('');

  const handleTogglePatient = () => {
    setIsPatientSelected(prev => !prev);
  };

  const handleToggleCaretaker = () => {
    setIsCaretakerSelected(prev => !prev);
  };

  const isBothSelected = isPatientSelected && isCaretakerSelected;

  const handleSubmit = async () => {
    if (isSignUp) {
      // 1. Validate role selection
      if (!isPatientSelected && !isCaretakerSelected) {
        Alert.alert('Select Account Type', 'Please choose how you would like to register: Patient, Caretaker, or Both.');
        return;
      }

      // 2. Validate common required fields
      if (!name.trim()) {
        Alert.alert('Required Field', 'Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        Alert.alert('Required Field', 'Please enter a valid email address.');
        return;
      }
      if (!password.trim() || password.length < 4) {
        Alert.alert('Required Field', 'Please create a password of at least 4 characters.');
        return;
      }
      if (!phone.trim()) {
        Alert.alert('Required Field', 'Please enter your phone number.');
        return;
      }

      // 3. Validate Patient required fields
      if (isPatientSelected) {
        if (!emergencyCaretakerPhone.trim()) {
          Alert.alert('Patient Requirement', 'Please provide an Emergency Caretaker Phone Number so SOS calls and missed alerts know whom to contact.');
          return;
        }
        if (!age.trim()) {
          Alert.alert('Patient Requirement', 'Please enter your age.');
          return;
        }
      }

      // 4. Validate Caretaker required fields
      if (isCaretakerSelected) {
        if (!relation.trim()) {
          Alert.alert('Caretaker Requirement', 'Please specify your relationship to the patient (e.g. Son, Daughter, Spouse, Guardian).');
          return;
        }
      }

      // Determine roles array
      const selectedRoles = [];
      if (isPatientSelected) selectedRoles.push('PATIENT');
      if (isCaretakerSelected) selectedRoles.push('CARETAKER');

      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        roles: selectedRoles,
        emergencyCaretakerPhone: isPatientSelected ? emergencyCaretakerPhone.trim() : '',
        age: isPatientSelected ? age.trim() : null,
        relation: isCaretakerSelected ? relation.trim() : '',
        patientCodeToLink: isCaretakerSelected ? patientCodeToLink.trim() : null,
      });

      const modeMessage = isBothSelected 
        ? 'Registered in Dual Mode (Patient & Caretaker)!'
        : isPatientSelected 
          ? 'Registered in Patient Mode!' 
          : 'Registered in Caretaker Mode!';

      Alert.alert('Account Created', `Welcome to MedCompanion, ${name}! ${modeMessage}`);
      if (onClose) onClose();
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Required Fields', 'Please enter your email and password.');
        return;
      }

      await loginUser(email.trim().toLowerCase(), password);
      Alert.alert('Signed In', `Welcome back!`);
      if (onClose) onClose();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Dismiss Button (if modal) */}
        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        )}

        {/* Top Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>MedCompanion</Text>
          <Text style={styles.appTagline}>
            {isSignUp ? 'Personalized Medication & Caretaker Companion' : 'Sign in to access your account'}
          </Text>
        </View>

        {/* Tab Switcher: Sign In vs Create Account */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, !isSignUp && styles.tabBtnActive]} 
            onPress={() => setIsSignUp(false)}
          >
            <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, isSignUp && styles.tabBtnActive]} 
            onPress={() => setIsSignUp(true)}
          >
            <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* SIGN UP SECTION: "How would you like to register?" */}
        {isSignUp ? (
          <>
            <View style={styles.roleSelectionBox}>
              <Text style={styles.roleSectionTitle}>How would you like to register?</Text>
              <Text style={styles.roleSectionSubtitle}>
                Select one or both options to customize your app experience:
              </Text>

              <View style={styles.roleOptionsGrid}>
                {/* 1. Patient Mode Checkable Card */}
                <TouchableOpacity
                  style={[
                    styles.roleSelectCard,
                    isPatientSelected && styles.roleSelectCardActive
                  ]}
                  onPress={handleTogglePatient}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleCardTopRow}>
                    <View style={[styles.roleIconCircle, isPatientSelected && styles.roleIconCircleActive]}>
                      <Ionicons 
                        name="person" 
                        size={22} 
                        color={isPatientSelected ? '#FFFFFF' : '#0D9488'} 
                      />
                    </View>
                    <View style={[styles.checkboxCircle, isPatientSelected && styles.checkboxCircleActive]}>
                      {isPatientSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                  </View>

                  <Text style={[styles.roleCardTitle, isPatientSelected && styles.roleCardTitleActive]}>
                    Patient Mode
                  </Text>
                  <Text style={styles.roleCardDescription}>
                    I take medicines and need alarms, countdown timer, voice readouts, and 1-tap SOS.
                  </Text>
                </TouchableOpacity>

                {/* 2. Caretaker Mode Checkable Card */}
                <TouchableOpacity
                  style={[
                    styles.roleSelectCard,
                    isCaretakerSelected && styles.roleSelectCardActive
                  ]}
                  onPress={handleToggleCaretaker}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleCardTopRow}>
                    <View style={[styles.roleIconCircle, isCaretakerSelected && styles.roleIconCircleActive]}>
                      <Ionicons 
                        name="shield-checkmark" 
                        size={22} 
                        color={isCaretakerSelected ? '#FFFFFF' : '#0D9488'} 
                      />
                    </View>
                    <View style={[styles.checkboxCircle, isCaretakerSelected && styles.checkboxCircleActive]}>
                      {isCaretakerSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                  </View>

                  <Text style={[styles.roleCardTitle, isCaretakerSelected && styles.roleCardTitleActive]}>
                    Caretaker Mode
                  </Text>
                  <Text style={styles.roleCardDescription}>
                    I monitor loved ones' daily prescriptions, manage schedules, and receive missed pill alerts.
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Both Modes Selected Highlight Banner */}
              {isBothSelected && (
                <View style={styles.bothSelectedBanner}>
                  <Ionicons name="flash" size={18} color="#0D9488" />
                  <Text style={styles.bothSelectedText}>
                    Dual Mode Enabled! You will be registered as both Patient and Caretaker, with dedicated pages for each.
                  </Text>
                </View>
              )}
            </View>

            {/* Required Entries Form */}
            <View style={styles.formCard}>
              <Text style={styles.formSectionHeader}>Required Account Details</Text>

              {/* Common: Full Name */}
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />

              {/* Common: Email Address */}
              <Text style={styles.fieldLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Common: Password */}
              <Text style={styles.fieldLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password (min 4 characters)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {/* Common: Phone */}
              <Text style={styles.fieldLabel}>Your Mobile Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              {/* PATIENT REQUIRED ENTRIES */}
              {isPatientSelected && (
                <View style={styles.roleSubformBox}>
                  <View style={styles.subformHeader}>
                    <Ionicons name="person-outline" size={18} color="#0D9488" />
                    <Text style={styles.subformTitle}>Patient Mode Information</Text>
                  </View>

                  <Text style={styles.fieldLabel}>Emergency Caretaker Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. +91 9876543210 (Caretaker to call / alert)"
                    keyboardType="phone-pad"
                    value={emergencyCaretakerPhone}
                    onChangeText={setEmergencyCaretakerPhone}
                  />

                  <Text style={styles.fieldLabel}>Patient Age *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 68"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />

                  <View style={styles.infoNoteBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#0284C7" />
                    <Text style={styles.infoNoteText}>
                      A permanent 6-digit Patient Code (e.g. MED-XXXX) will be generated for your account so caretakers can pair with you.
                    </Text>
                  </View>
                </View>
              )}

              {/* CARETAKER REQUIRED ENTRIES */}
              {isCaretakerSelected && (
                <View style={[styles.roleSubformBox, { borderColor: '#E2E8F0' }]}>
                  <View style={styles.subformHeader}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#0D9488" />
                    <Text style={styles.subformTitle}>Caretaker Mode Information</Text>
                  </View>

                  <Text style={styles.fieldLabel}>Relationship to Patient *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Son, Daughter, Spouse, Guardian"
                    value={relation}
                    onChangeText={setRelation}
                  />

                  <Text style={styles.fieldLabel}>Patient Pairing Code (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. MED-7821 (or link later from dashboard)"
                    autoCapitalize="characters"
                    value={patientCodeToLink}
                    onChangeText={setPatientCodeToLink}
                  />
                </View>
              )}

              {/* Complete Registration Button */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Complete Registration</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* SIGN IN SECTION */
          <View style={styles.formCard}>
            <Text style={styles.formSectionHeader}>Welcome Back</Text>

            <Text style={styles.fieldLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.fieldLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Sign In</Text>
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0D9488',
  },
  roleSelectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roleSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleSectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  roleOptionsGrid: {
    gap: 12,
  },
  roleSelectCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  roleSelectCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  roleCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconCircleActive: {
    backgroundColor: '#0D9488',
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  roleCardTitleActive: {
    color: '#0D9488',
  },
  roleCardDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  bothSelectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  bothSelectedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formSectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  roleSubformBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  subformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subformTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D9488',
  },
  infoNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
