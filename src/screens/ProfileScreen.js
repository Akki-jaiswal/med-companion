import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const ProfileScreen = ({ onOpenAuth }) => {
  const { currentUser, userRole, logoutUser, switchUserRole } = useApp();

  const hasBothRoles = currentUser?.roles?.includes('PATIENT') && currentUser?.roles?.includes('CARETAKER');

  const handleShareCode = async () => {
    if (!currentUser?.pairingCode) {
      Alert.alert('No Code', 'No patient pairing code found for this profile.');
      return;
    }
    try {
      await Share.share({
        message: `Hi! Here is my MedCompanion Patient Code: ${currentUser.pairingCode}. Please enter this in your Caretaker app to monitor my daily medications!`,
      });
    } catch (error) {
      Alert.alert('Your Code', currentUser.pairingCode);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MedCompanion?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logoutUser }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatarCircle, { backgroundColor: userRole === 'PATIENT' ? '#0D9488' : '#4F46E5' }]}>
          <Ionicons 
            name={userRole === 'PATIENT' ? 'person' : 'shield-checkmark'} 
            size={36} 
            color="#FFFFFF" 
          />
        </View>
        <Text style={styles.userName}>{currentUser?.name || 'User Profile'}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || ''}</Text>

        <View style={[
          styles.roleBadge, 
          userRole === 'CARETAKER' && styles.roleBadgeCaretaker,
          hasBothRoles && styles.roleBadgeDual
        ]}>
          <Text style={[
            styles.roleBadgeText, 
            userRole === 'CARETAKER' && styles.roleBadgeTextCaretaker,
            hasBothRoles && styles.roleBadgeTextDual
          ]}>
            {hasBothRoles 
              ? `⚡ DUAL ACCOUNT (${userRole === 'PATIENT' ? 'PATIENT ACTIVE' : 'CARETAKER ACTIVE'})`
              : userRole === 'PATIENT' ? '👤 PATIENT ACCOUNT' : '🛡️ CARETAKER ACCOUNT'}
          </Text>
        </View>
      </View>

      {/* Dual Mode Switcher Card (If user registered as Both) */}
      {hasBothRoles && (
        <View style={styles.dualCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dualCardTitle}>Switch Active Mode</Text>
            <Text style={styles.dualCardSub}>
              Currently in: <Text style={{ fontWeight: 'bold' }}>{userRole === 'PATIENT' ? 'Patient Screen' : 'Caretaker Screen'}</Text>
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.dualSwitchBtn}
            onPress={() => switchUserRole(userRole === 'PATIENT' ? 'CARETAKER' : 'PATIENT')}
          >
            <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
            <Text style={styles.dualSwitchBtnText}>
              Switch to {userRole === 'PATIENT' ? 'Caretaker' : 'Patient'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6-Digit Pairing Code Showcase Card (If Patient) */}
      {(userRole === 'PATIENT' || currentUser?.roles?.includes('PATIENT')) && currentUser?.pairingCode && (
        <View style={styles.pairingCard}>
          <View style={styles.pairingTop}>
            <View>
              <Text style={styles.pairingTitle}>YOUR PATIENT CODE</Text>
              <Text style={styles.pairingSub}>Share this 6-digit code with your Caretaker to link devices</Text>
            </View>
            <Ionicons name="key-outline" size={24} color="#0D9488" />
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{currentUser.pairingCode}</Text>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
            <Ionicons name="share-social-outline" size={18} color="#0D9488" />
            <Text style={styles.shareBtnText}>Share Code with Family / Caretaker</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Settings List */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.rowItem}>
          <View style={styles.rowIcon}>
            <Ionicons name="call-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Registered Phone</Text>
            <Text style={styles.rowValue}>{currentUser?.phone || 'Not Specified'}</Text>
          </View>
        </View>

        {currentUser?.emergencyCaretakerPhone ? (
          <View style={styles.rowItem}>
            <View style={styles.rowIcon}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Emergency Caretaker Phone</Text>
              <Text style={styles.rowValue}>{currentUser.emergencyCaretakerPhone}</Text>
            </View>
          </View>
        ) : null}

        {currentUser?.age ? (
          <View style={styles.rowItem}>
            <View style={styles.rowIcon}>
              <Ionicons name="calendar-outline" size={20} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Patient Age</Text>
              <Text style={styles.rowValue}>{currentUser.age} Years</Text>
            </View>
          </View>
        ) : null}

        {currentUser?.relation ? (
          <View style={styles.rowItem}>
            <View style={styles.rowIcon}>
              <Ionicons name="heart-outline" size={20} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Caretaker Relationship</Text>
              <Text style={styles.rowValue}>{currentUser.relation}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.rowItem}>
          <View style={styles.rowIcon}>
            <Ionicons name="notifications-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Device Alarms</Text>
            <Text style={styles.rowValue}>Active (MAX Priority + Sound & Vibrate)</Text>
          </View>
        </View>
      </View>

      {/* Authentication Actions */}
      <TouchableOpacity style={styles.switchAccountBtn} onPress={onOpenAuth}>
        <Ionicons name="swap-horizontal" size={20} color="#0D9488" />
        <Text style={styles.switchAccountText}>Switch Account or Register New</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  roleBadgeCaretaker: {
    backgroundColor: '#E0E7FF',
  },
  roleBadgeDual: {
    backgroundColor: '#FEF3C7',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  roleBadgeTextCaretaker: {
    color: '#4338CA',
  },
  roleBadgeTextDual: {
    color: '#B45309',
  },
  dualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#0D9488',
    gap: 12,
  },
  dualCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  dualCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dualSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dualSwitchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pairingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pairingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pairingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1,
  },
  pairingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 260,
  },
  codeBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F766E',
    letterSpacing: 4,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CCFBF1',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 10,
  },
  switchAccountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
