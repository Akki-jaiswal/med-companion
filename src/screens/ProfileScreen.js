import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const ProfileScreen = ({ onOpenAuth }) => {
  const { currentUser, userRole, logoutUser } = useApp();

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Hi! Here is my MedCompanion Patient Code: ${currentUser?.pairingCode || 'MED-7821'}. Please enter this in your Caretaker app to monitor my medications!`,
      });
    } catch (error) {
      Alert.alert('Share', `Your Code is: ${currentUser?.pairingCode || 'MED-7821'}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons 
            name={userRole === 'PATIENT' ? 'person' : 'shield-checkmark'} 
            size={40} 
            color="#FFFFFF" 
          />
        </View>
        <Text style={styles.userName}>{currentUser?.name || 'Robert Jaiswal'}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || 'robert@medcompanion.com'}</Text>

        <View style={[styles.roleBadge, userRole === 'CARETAKER' && styles.roleBadgeCaretaker]}>
          <Text style={[styles.roleBadgeText, userRole === 'CARETAKER' && styles.roleBadgeTextCaretaker]}>
            {userRole === 'PATIENT' ? '👤 PATIENT ACCOUNT' : '👨‍⚕️ CARETAKER ACCOUNT'}
          </Text>
        </View>
      </View>

      {/* 6-Digit Pairing Code Showcase Card */}
      {userRole === 'PATIENT' && (
        <View style={styles.pairingCard}>
          <View style={styles.pairingTop}>
            <View>
              <Text style={styles.pairingTitle}>YOUR PATIENT CODE</Text>
              <Text style={styles.pairingSub}>Share this 6-digit code with your children or caretaker</Text>
            </View>
            <Ionicons name="key-outline" size={24} color="#0D9488" />
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{currentUser?.pairingCode || 'MED-7821'}</Text>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
            <Ionicons name="share-social-outline" size={18} color="#0D9488" />
            <Text style={styles.shareBtnText}>Share Code with Family</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Settings List */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account & Health Settings</Text>

        <View style={styles.rowItem}>
          <View style={styles.rowIcon}>
            <Ionicons name="call-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Emergency Phone</Text>
            <Text style={styles.rowValue}>{currentUser?.phone || '+91 98765 43210'}</Text>
          </View>
        </View>

        <View style={styles.rowItem}>
          <View style={styles.rowIcon}>
            <Ionicons name="notifications-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Background Reminders</Text>
            <Text style={styles.rowValue}>Active (Exact Device Alarms)</Text>
          </View>
        </View>

        <View style={styles.rowItem}>
          <View style={styles.rowIcon}>
            <Ionicons name="cloud-done-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Cloud Sync Status</Text>
            <Text style={styles.rowValue}>Ready for Firebase Firestore</Text>
          </View>
        </View>
      </View>

      {/* Authentication Actions */}
      <TouchableOpacity style={styles.switchAccountBtn} onPress={onOpenAuth}>
        <Ionicons name="swap-horizontal" size={20} color="#0D9488" />
        <Text style={styles.switchAccountText}>Switch Account or Register New</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
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
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0D9488',
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
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  roleBadgeCaretaker: {
    backgroundColor: '#EEF2FF',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  roleBadgeTextCaretaker: {
    color: '#4F46E5',
  },
  pairingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CCFBF1',
    marginBottom: 20,
  },
  pairingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pairingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1,
  },
  pairingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    maxWidth: '90%',
  },
  codeBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0D9488',
    letterSpacing: 4,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  switchAccountText: {
    color: '#0D9488',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
