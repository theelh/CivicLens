import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import api from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setOpen(!open);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [userMsg, ...prev]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot', {
        message: input,
      });

      setMessages((prev) => [
        { role: 'ai', text: res.data.reply ?? 'No response' },
        ...prev,
      ]);
    } catch {
      setMessages((prev) => [
        { role: 'ai', text: '⚠️ AI error' },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      {!open && (
        <TouchableOpacity style={styles.fab} onPress={toggleChat}>
        <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.grad}>
                <FontAwesome6 name="brain" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* CHAT POPUP */}
      {open && (
        <View style={styles.popup}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Assistant</Text>
            <TouchableOpacity onPress={toggleChat}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* MESSAGES */}
          <View style={styles.body}>
            {messages.length === 0 && (
              <Text style={styles.empty}>
                👋 Ask me anything about reports or city issues
              </Text>
            )}

            {messages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.msg,
                  m.role === 'user' ? styles.user : styles.ai,
                ]}
              >
                <Text style={styles.msgText}>{m.text}</Text>
              </View>
            ))}
          </View>

          {/* INPUT */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.inputBar}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask something..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.send}>
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },

  grad: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 20, },

  popup: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 320,
    height: 420,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  body: {
    flex: 1,
    padding: 10,
  },

  empty: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },

  msg: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },

  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
  },

  ai: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
  },

  msgText: {
    color: '#fff',
    fontSize: 13,
  },

  inputBar: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0b1220',
  },

  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 8,
    color: '#fff',
  },

  send: {
    marginLeft: 8,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
