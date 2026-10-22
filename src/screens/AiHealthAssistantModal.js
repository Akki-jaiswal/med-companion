import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { generateAiHealthResponse, generateDynamicSuggestions } from '../services/aiMedicalService';

export const AiHealthAssistantModal = ({ visible, onClose }) => {
  const { currentUser, medications, userRole, selectedPatientId } = useApp();
  const userName = currentUser?.name?.split(' ')[0] || 'Friend';

  // Target medications for the active context (Patient or Caretaker viewing patient)
  const activeMeds = userRole === 'CARETAKER' && selectedPatientId
    ? medications.filter(m => m.patientId === selectedPatientId)
    : medications.filter(m => !m.patientId || m.patientId === 'self' || m.patientId === currentUser?.id);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${userName}! 👋 I am your MedCompanion AI Clinical Assistant.\n\nI have loaded your active medical profile. You can ask me:\n• "What diseases do my medicines solve?"\n• "When should I take my pills?"\n• "Which of my medicines is for blood pressure / diabetes / pain?"\n• Or any question about dietary rules & interactions!\n\nHow can I help you today?`,
      time: 'Just now'
    }
  ]);

  const quickQuestions = generateDynamicSuggestions(activeMeds);

  const handleSend = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Clinical AI reasoning reply
    setTimeout(() => {
      const reply = generateAiHealthResponse(text, activeMeds, userName);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 450);
  };

  const renderFormattedText = (text, isAi) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
      <View style={styles.formattedContainer}>
        {lines.map((rawLine, lineIdx) => {
          const line = rawLine.trim();

          // Empty line spacing
          if (!line) {
            return <View key={lineIdx} style={styles.lineSpacer} />;
          }

          // Section header detection
          const isHeader = 
            line.startsWith('📋') || 
            line.startsWith('🩺') || 
            line.startsWith('💡') || 
            line.startsWith('💊') || 
            line.startsWith('💧') || 
            line.startsWith('###') ||
            /^\*\*\d+\./.test(line);

          const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('* ');

          let content = line;
          if (isBullet) {
            content = line.replace(/^[•\-\*]\s*/, '');
          }

          const parts = content.split(/\*\*(.*?)\*\*/g);

          if (isBullet) {
            return (
              <View key={lineIdx} style={styles.bulletRow}>
                <Text style={isAi ? styles.bulletIconAi : styles.bulletIconUser}>•</Text>
                <Text style={[styles.bubbleText, isAi ? styles.aiText : styles.userText, { flex: 1 }]}>
                  {parts.map((part, pIdx) => {
                    if (pIdx % 2 === 1) {
                      return (
                        <Text key={pIdx} style={isAi ? styles.aiBold : styles.userBold}>
                          {part}
                        </Text>
                      );
                    }
                    return (
                      <Text key={pIdx} style={isAi ? styles.aiNormal : styles.userNormal}>
                        {part}
                      </Text>
                    );
                  })}
                </Text>
              </View>
            );
          }

          return (
            <Text
              key={lineIdx}
              style={[
                styles.bubbleText,
                isAi ? styles.aiText : styles.userText,
                isHeader && styles.headerLine,
                lineIdx > 0 && { marginTop: 2 },
              ]}
            >
              {parts.map((part, pIdx) => {
                if (pIdx % 2 === 1) {
                  return (
                    <Text key={pIdx} style={isAi ? (isHeader ? styles.aiHeaderBold : styles.aiBold) : styles.userBold}>
                      {part}
                    </Text>
                  );
                }
                return (
                  <Text key={pIdx} style={isAi ? styles.aiNormal : styles.userNormal}>
                    {part}
                  </Text>
                );
              })}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={16} color="#38BDF8" />
              <Text style={styles.headerTitle}>MedCompanion AI</Text>
            </View>
            <Text style={styles.headerSub}>Always online • Medical Knowledge Base</Text>
          </View>
          <View style={styles.aiGlowDot} />
        </View>

        {/* Chat History */}
        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <View key={m.id} style={[styles.bubbleWrapper, isAi ? styles.bubbleLeft : styles.bubbleRight]}>
                {isAi && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  </View>
                )}
                <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
                  {renderFormattedText(m.text, isAi)}
                  <Text style={[styles.bubbleTime, isAi ? styles.aiTime : styles.userTime]}>
                    {m.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Quick Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💡 Quick Questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
              {quickQuestions.map((q, idx) => (
                <TouchableOpacity key={idx} style={styles.quickChip} onPress={() => handleSend(q)}>
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Ask AI about your medicines, ${userName}...`}
            placeholderTextColor="#94A3B8"
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputMessage.trim() && { backgroundColor: '#64748B' }]} 
            onPress={() => handleSend()}
            disabled={!inputMessage.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiGlowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    alignItems: 'flex-end',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '86%',
    padding: 14,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#0D9488',
    borderBottomRightRadius: 4,
  },
  formattedContainer: {
    width: '100%',
  },
  lineSpacer: {
    height: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    gap: 6,
  },
  bulletIconAi: {
    color: '#38BDF8',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  bulletIconUser: {
    color: '#CCFBF1',
    fontSize: 15,
    lineHeight: 22,
  },
  aiBold: {
    fontWeight: '800',
    color: '#38BDF8',
  },
  userBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiHeaderBold: {
    fontWeight: '900',
    color: '#F8FAFC',
    fontSize: 16,
  },
  aiNormal: {
    color: '#F1F5F9',
    fontWeight: '400',
  },
  userNormal: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  headerLine: {
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: '#F1F5F9',
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  aiTime: {
    color: '#64748B',
  },
  userTime: {
    color: '#CCFBF1',
  },
  suggestionsContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  quickScroll: {
    flexDirection: 'row',
  },
  quickChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  quickChipText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
