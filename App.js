import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { PatientHomeScreen } from './src/screens/PatientHomeScreen';
import { CaretakerDashboardScreen } from './src/screens/CaretakerDashboardScreen';
import { WeeklyReportScreen } from './src/screens/WeeklyReportScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { AiHealthAssistantModal } from './src/screens/AiHealthAssistantModal';
import { AlarmModal } from './src/screens/AlarmModal';
import { BottomNavBar } from './src/components/BottomNavBar';

const MainNavigator = () => {
  const { userRole, setUserRole, currentUser } = useApp();
  
  // Navigation tabs: 'home', 'prescriptions', 'reports', 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [aiAssistantVisible, setAiAssistantVisible] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return userRole === 'PATIENT' ? <PatientHomeScreen /> : <CaretakerDashboardScreen onNavigateReport={() => setActiveTab('reports')} />;
      case 'prescriptions':
        return userRole === 'PATIENT' ? <PatientHomeScreen /> : <CaretakerDashboardScreen onNavigateReport={() => setActiveTab('reports')} />;
      case 'reports':
        return <WeeklyReportScreen onBack={() => setActiveTab('home')} />;
      case 'profile':
        return <ProfileScreen onOpenAuth={() => setAuthModalVisible(true)} />;
      default:
        return <PatientHomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header & Dual Role Switcher Bar */}
      <View style={styles.roleSwitchContainer}>
        <View style={styles.topInfoRow}>
          <View style={styles.userBadge}>
            <View style={styles.userStatusDot} />
            <Text style={styles.userGreetingText}>
              {currentUser?.name || 'Akshay Jaiswal'}
            </Text>
          </View>

          {/* Quick Login/Profile Shortcut */}
          <TouchableOpacity 
            style={styles.authShortcutBtn}
            onPress={() => setAuthModalVisible(true)}
          >
            <Ionicons name="key-outline" size={16} color="#0D9488" />
            <Text style={styles.authShortcutText}>Accounts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roleSwitchPill}>
          <TouchableOpacity
            style={[styles.roleBtn, userRole === 'PATIENT' && styles.roleBtnActive]}
            onPress={() => setUserRole('PATIENT')}
          >
            <Ionicons 
              name="person" 
              size={15} 
              color={userRole === 'PATIENT' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.roleBtnText, userRole === 'PATIENT' && styles.roleBtnTextActive]}>
              Patient Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, userRole === 'CARETAKER' && styles.roleBtnActive]}
            onPress={() => setUserRole('CARETAKER')}
          >
            <Ionicons 
              name="shield-checkmark" 
              size={15} 
              color={userRole === 'CARETAKER' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.roleBtnText, userRole === 'CARETAKER' && styles.roleBtnTextActive]}>
              Caretaker Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Screen Content */}
      <View style={styles.mainContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation Bar with Meta-AI Style Floating Button */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAiAssistant={() => setAiAssistantVisible(true)}
        userRole={userRole}
      />

      {/* Full-Screen Alarm Modal (Pulsing sound & countdown) */}
      <AlarmModal />

      {/* Meta AI-style Slide Chatbot Modal */}
      <AiHealthAssistantModal
        visible={aiAssistantVisible}
        onClose={() => setAiAssistantVisible(false)}
      />

      {/* Authentication Modal */}
      {authModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <AuthScreen onClose={() => setAuthModalVisible(false)} />
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  userGreetingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  authShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  authShortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
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
    paddingVertical: 9,
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
    fontSize: 12,
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
