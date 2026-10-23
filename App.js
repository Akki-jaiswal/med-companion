import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { PatientHomeScreen } from './src/screens/PatientHomeScreen';
import { MedicinesScreen } from './src/screens/MedicinesScreen';
import { CaretakerDashboardScreen } from './src/screens/CaretakerDashboardScreen';
import { WeeklyReportScreen } from './src/screens/WeeklyReportScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { AiHealthAssistantModal } from './src/screens/AiHealthAssistantModal';
import { AlarmModal } from './src/screens/AlarmModal';
import { CaretakerEmergencyAlarmModal } from './src/screens/CaretakerEmergencyAlarmModal';
import { BottomNavBar } from './src/components/BottomNavBar';

const MainNavigator = () => {
  const { userRole, currentUser, switchUserRole } = useApp();
  
  // Navigation tabs: 'home', 'prescriptions', 'reports', 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [aiAssistantVisible, setAiAssistantVisible] = useState(false);

  const hasBothRoles = currentUser?.roles?.includes('PATIENT') && currentUser?.roles?.includes('CARETAKER');

  // Enforce Android Sticky-Immersive Mode (hides the 3-button navigation bar ||| O < automatically)
  useEffect(() => {
    const applyStickyImmersive = async () => {
      if (Platform.OS === 'android' && NavigationBar) {
        try {
          if (typeof NavigationBar.setVisibilityAsync === 'function') {
            await NavigationBar.setVisibilityAsync('hidden');
          }
          if (typeof NavigationBar.setBehaviorAsync === 'function') {
            await NavigationBar.setBehaviorAsync('overlay-swipe');
          }
        } catch (e) {
          // Silent fallback if device doesn't support soft navbar manipulation
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
        return userRole === 'PATIENT' ? <PatientHomeScreen onNavigateMedicines={() => setActiveTab('prescriptions')} /> : <CaretakerDashboardScreen onNavigateReport={() => setActiveTab('reports')} />;
      case 'prescriptions':
        return userRole === 'PATIENT' ? <MedicinesScreen /> : <CaretakerDashboardScreen onNavigateReport={() => setActiveTab('reports')} />;
      case 'reports':
        return <WeeklyReportScreen onBack={() => setActiveTab('home')} />;
      case 'profile':
        return <ProfileScreen onOpenAuth={() => setAuthModalVisible(true)} />;
      default:
        return userRole === 'PATIENT' ? <PatientHomeScreen /> : <CaretakerDashboardScreen onNavigateReport={() => setActiveTab('reports')} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Top Header (Dedicated mode, no simultaneous double screens) */}
      <View style={styles.topHeaderBar}>
        <View style={styles.brandingBox}>
          <View style={styles.appIconCircle}>
            <Ionicons name="medical" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.appBrandText}>MedCompanion</Text>
        </View>

        <View style={styles.headerRightBox}>
          {/* If user registered with BOTH roles, provide dedicated view switcher */}
          {hasBothRoles && (
            <TouchableOpacity 
              style={styles.switchRoleButton} 
              onPress={() => switchUserRole(userRole === 'PATIENT' ? 'CARETAKER' : 'PATIENT')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="swap-horizontal" 
                size={14} 
                color="#0D9488" 
              />
              <Text style={styles.switchRoleButtonText}>
                {userRole === 'PATIENT' ? 'To Caretaker' : 'To Patient'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.userStatusBadge}>
            <View style={[styles.userStatusDot, { backgroundColor: userRole === 'PATIENT' ? '#0D9488' : '#4F46E5' }]} />
            <Text style={styles.userNameText} numberOfLines={1}>
              {currentUser?.name || 'User'} ({userRole === 'PATIENT' ? 'Patient' : 'Caretaker'})
            </Text>
          </View>
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

      {/* Full-Screen Caretaker Emergency Alarm Modal (Red Siren, Voice TTS & Direct Call for Caretakers) */}
      <CaretakerEmergencyAlarmModal />

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

const RootNavigator = () => {
  const { currentUser } = useApp();

  // If user is not logged in / not registered, show the dynamic Registration / Login Screen!
  if (!currentUser || !currentUser.isAuthenticated) {
    return <AuthScreen onClose={null} />;
  }

  return <MainNavigator />;
};

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  topHeaderBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBrandText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  switchRoleButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  userStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    maxWidth: 160,
  },
  userStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
