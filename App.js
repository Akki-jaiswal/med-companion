import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
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

  // Enforce Android Sticky-Immersive Mode (hides the 3-button navigation bar ||| O < automatically)
  useEffect(() => {
    const applyStickyImmersive = async () => {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } catch (e) {
          console.log('NavigationBar note:', e.message);
        }
      }
    };

    applyStickyImmersive();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        applyStickyImmersive();
      }
    });

    return () => sub.remove();
  }, []);

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

      {/* Clean Top Header & Mode Toggle */}
      <View style={styles.roleSwitchContainer}>
        <View style={styles.topInfoRow}>
          <View style={styles.brandingBox}>
            <View style={styles.appIconCircle}>
              <Ionicons name="medical" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.appBrandText}>MedCompanion</Text>
          </View>

          <View style={styles.userStatusBadge}>
            <View style={styles.userStatusDot} />
            <Text style={styles.userNameText}>{currentUser?.name || 'Patient'}</Text>
          </View>
        </View>

        {/* Dual Mode Switcher Pill */}
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

      {/* Full-Screen Alarm Modal (Pulsing sound, voice TTS & countdown) */}
      <AlarmModal />

      {/* Meta AI-style Health Chatbot Modal */}
      <AiHealthAssistantModal
        visible={aiAssistantVisible}
        onClose={() => setAiAssistantVisible(false)}
      />

      {/* Auth Screen Modal (Only shown if triggered from Profile) */}
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBrandText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  userStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
  },
  userStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
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
