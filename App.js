import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { PatientHomeScreen } from './src/screens/PatientHomeScreen';
import { CaretakerDashboardScreen } from './src/screens/CaretakerDashboardScreen';
import { WeeklyReportScreen } from './src/screens/WeeklyReportScreen';
import { AlarmModal } from './src/screens/AlarmModal';

const MainNavigator = () => {
  const { userRole, setUserRole } = useApp();
  const [caretakerTab, setCaretakerTab] = useState('dashboard'); // 'dashboard' or 'report'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Dual Mode Switcher Bar */}
      <View style={styles.roleSwitchContainer}>
        <View style={styles.roleSwitchPill}>
          <TouchableOpacity
            style={[styles.roleBtn, userRole === 'PATIENT' && styles.roleBtnActive]}
            onPress={() => setUserRole('PATIENT')}
          >
            <Ionicons 
              name="person" 
              size={16} 
              color={userRole === 'PATIENT' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.roleBtnText, userRole === 'PATIENT' && styles.roleBtnTextActive]}>
              Patient Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, userRole === 'CARETAKER' && styles.roleBtnActive]}
            onPress={() => {
              setUserRole('CARETAKER');
              setCaretakerTab('dashboard');
            }}
          >
            <Ionicons 
              name="shield-checkmark" 
              size={16} 
              color={userRole === 'CARETAKER' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.roleBtnText, userRole === 'CARETAKER' && styles.roleBtnTextActive]}>
              Caretaker Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContainer}>
        {userRole === 'PATIENT' ? (
          <PatientHomeScreen />
        ) : caretakerTab === 'report' ? (
          <WeeklyReportScreen onBack={() => setCaretakerTab('dashboard')} />
        ) : (
          <CaretakerDashboardScreen onNavigateReport={() => setCaretakerTab('report')} />
        )}
      </View>

      {/* Full-Screen Alarm Popup (Can trigger anywhere) */}
      <AlarmModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  roleSwitchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roleSwitchPill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleBtnActive: {
    backgroundColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
  },
});
