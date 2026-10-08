import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const AuthScreen = ({ onClose }) => {
  const { loginUser, registerUser } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [role, setRole] = useState('PATIENT'); // 'PATIENT' or 'CARETAKER'
  const [patientCodeToLink, setPatientCodeToLink] = useState('');

  const handleSubmit = () => {
    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert('Required Fields', 'Please fill in your name, email, and password.');
        return;
      }

      registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
        patientCodeToLink: role === 'CARETAKER' ? patientCodeToLink.trim() : null,
      });

      Alert.alert('Account Created', `Welcome to MedCompanion, ${name}!`);
      if (onClose) onClose();
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Required Fields', 'Please enter your email and password.');
        return;
      }

      loginUser(email.trim().toLowerCase(), password);
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
        {/* Top Dismiss Button */}
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
          <Text style={styles.appTagline}>Secure Patient & Caretaker Access</Text>
        </View>

        {/* Tab Switcher */}
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

        {/* Role Selector (on signup) */}
        {isSignUp && (
          <View style={styles.roleSelectionBox}>
            <Text style={styles.fieldLabel}>Select Account Mode</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard, role === 'PATIENT' && styles.roleCardActive]}
                onPress={() => setRole('PATIENT')}
              >
                <Ionicons name="person" size={24} color={role === 'PATIENT' ? '#0D9488' : '#64748B'} />
                <Text style={[styles.roleCardTitle, role === 'PATIENT' && styles.roleCardTitleActive]}>
                  Patient
                </Text>
                <Text style={styles.roleCardSub}>For elderly taking medicines</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleCard, role === 'CARETAKER' && styles.roleCardActive]}
                onPress={() => setRole('CARETAKER')}
              >
                <Ionicons name="shield-checkmark" size={24} color={role === 'CARETAKER' ? '#0D9488' : '#64748B'} />
                <Text style={[styles.roleCardTitle, role === 'CARETAKER' && styles.roleCardTitleActive]}>
                  Caretaker
                </Text>
                <Text style={styles.roleCardSub}>For family & guardians</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.formCard}>
          {isSignUp && (
            <>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <Text style={styles.fieldLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {isSignUp && (
            <>
              <Text style={styles.fieldLabel}>Emergency Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              {role === 'CARETAKER' && (
                <>
                  <Text style={styles.fieldLabel}>Patient Pairing Code (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. MED-7821"
                    autoCapitalize="characters"
                    value={patientCodeToLink}
                    onChangeText={setPatientCodeToLink}
                  />
                </>
              )}
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>
              {isSignUp ? 'Complete Registration' : 'Sign In'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 44 : 20,
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
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
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
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
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
    marginBottom: 16,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
    marginTop: 6,
  },
  roleCardTitleActive: {
    color: '#0D9488',
  },
  roleCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
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
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
