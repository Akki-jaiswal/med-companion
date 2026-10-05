import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const AiHealthAssistantModal = ({ visible, onClose }) => {
  const { currentUser } = useApp();
  const userName = currentUser?.name?.split(' ')[0] || 'Friend';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${userName}! 👋 I am your MedCompanion AI Assistant.\n\nYou can ask me about medication dosage, food interactions, side-effects, or what to do if a dose is delayed. How can I help you today?`,
      time: 'Just now'
    }
  ]);

  const quickQuestions = [
    'Can I take Metformin on an empty stomach?',
    'What should I do if I miss a BP dose?',
    'Any food interactions with blood pressure tablets?',
    'Why is it important to take medicines with water?'
  ];

  const getAiResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('empty stomach') || q.includes('food') || q.includes('meal')) {
      return '🍽️ Dietary Advice: Most diabetes and pain medicines like Metformin or Ibuprofen should be taken AFTER food to prevent stomach irritation and nausea. Blood pressure pills can usually be taken before or after, but keep the timing consistent every day!';
    } else if (q.includes('miss') || q.includes('forgot') || q.includes('late')) {
      return '⏰ Missed Dose Rule: Take the missed tablet as soon as you remember. However, if it is almost time for your next scheduled dose, SKIP the missed dose and resume your regular schedule. NEVER take a double dose to compensate!';
    } else if (q.includes('blood pressure') || q.includes('bp') || q.includes('amlodipine')) {
      return '🩺 Blood Pressure Pill Info: Avoid eating grapefruit or drinking alcohol, as they can interfere with how your body absorbs calcium channel blockers (like Amlodipine). Try to take it at the exact same hour each morning.';
    } else if (q.includes('water')) {
      return '💧 Taking with Water: Always swallow tablets with a full glass (250ml) of plain room-temperature water. This ensures the pill reaches the stomach properly and does not irritate your esophagus or throat.';
    } else {
      return `💡 Advice regarding "${query}": Keep your prescriptions stored in a cool, dry place away from direct sunlight. Make sure to consult your doctor before changing dosages, and notify your caretaker if you feel any dizziness!`;
    }
  };

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

    // Simulate AI thinking and reply
    setTimeout(() => {
      const reply = getAiResponse(text);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
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
                  <Text style={[styles.bubbleText, isAi ? styles.aiText : styles.userText]}>
                    {m.text}
                  </Text>
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
    maxWidth: '82%',
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
