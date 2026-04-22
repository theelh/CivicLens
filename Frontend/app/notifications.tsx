import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

// ── Theme ─────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:          '#f8fafc',
  headerEnd:   '#0f172a',
  card:        '#ffffff',
  cardUnread:  '#f0f9ff',
  cardBorder:  'transparent',
  title:       '#0f172a',
  message:     '#475569',
  time:        '#94a3b8',
  groupDate:   '#94a3b8',
  emptyTitle:  '#0f172a',
  emptyText:   '#64748b',
  loadingText: '#64748b',
  markAllText: '#fff',
  unreadBadgeBg: '#ef4444',
};

const DARK = {
  bg:          '#080c14',
  headerEnd:   '#040810',
  card:        '#111827',
  cardUnread:  '#0c1a2e',
  cardBorder:  'rgba(255,255,255,0.06)',
  title:       '#f1f5f9',
  message:     '#94a3b8',
  time:        '#64748b',
  groupDate:   '#64748b',
  emptyTitle:  '#f1f5f9',
  emptyText:   '#64748b',
  loadingText: '#94a3b8',
  markAllText: '#fff',
  unreadBadgeBg: '#ef4444',
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'success';
  is_read: boolean;
  created_at: string;
  report_id?: number;
}

const TYPE_META = {
  urgent:  { color: '#ef4444', icon: 'alert-circle',       bg: 'rgba(239,68,68,0.15)'  },
  success: { color: '#10b981', icon: 'checkmark-circle',   bg: 'rgba(16,185,129,0.15)' },
  info:    { color: '#3b82f6', icon: 'information-circle', bg: 'rgba(59,130,246,0.15)' },
};

// ── Notification card ─────────────────────────────────────────────────────────
function NotificationCard({
  item,
  onPress,
  onMarkRead,
  anim,
  dark,
}: {
  item: Notification;
  onPress: (n: Notification) => void;
  onMarkRead: (id: number) => void;
  anim: Animated.Value;
  dark: boolean;
}) {
  const t    = dark ? DARK : LIGHT;
  const meta = TYPE_META[item.type] ?? TYPE_META.info;

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    }}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(item)}
        style={[
          nS.card,
          {
            backgroundColor: item.is_read ? t.card : t.cardUnread,
            borderColor: t.cardBorder,
            borderLeftColor: item.is_read ? 'transparent' : meta.color,
            borderLeftWidth: item.is_read ? 0 : 4,
          },
        ]}
      >
        {/* Icon */}
        <View style={[nS.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={20} color={meta.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={nS.topRow}>
            <Text style={[nS.title, { color: t.title }]} numberOfLines={1}>{item.title}</Text>
            {!item.is_read && (
              <TouchableOpacity
                onPress={() => onMarkRead(item.id)}
                style={nS.markReadBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={nS.markReadText}>Mark read</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[nS.message, { color: t.message }]} numberOfLines={2}>{item.message}</Text>

          <View style={nS.bottomRow}>
            <Text style={[nS.time, { color: t.time }]}>
              {formatTime(item.created_at)}
            </Text>
            {item.type === 'urgent' && (
              <View style={nS.urgentBadge}>
                <Text style={nS.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
        </View>

        {/* Unread dot */}
        {!item.is_read && (
          <View style={[nS.dot, { backgroundColor: meta.color }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ReportsNotif() {
  const { token }   = useAuth();
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const dark        = colorScheme === 'dark';
  const t           = dark ? DARK : LIGHT;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications ?? []);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleOpenNotification = async (notification: Notification) => {
    try {
      await api.post(`/notifications/${notification.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      router.push({
        pathname: '/notification-details',
        params: { notification: JSON.stringify(notification) },
      });
    } catch (e) { console.error(e); }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
  };

  // ── Group by date ───────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach(n => {
      const key = new Date(n.created_at).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return Object.entries(groups);
  }, [notifications]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient
        colors={['#1e3a5f', '#0f172a']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}
      >
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500' }}>
          Loading notifications…
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={dark ? ['#2369A4', '#040810'] : ['#2369A4', '#f8fafc']}
        style={[hS.hero, { paddingTop: insets.top + 12 }]}
      >
        <View style={hS.row}>
          <TouchableOpacity onPress={() => router.back()} style={hS.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[hS.title, {color : dark ? "#fff": "#000"}]}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={[hS.sub, {color : dark ? "#fff": "#000"}]}>{unreadCount} unread</Text>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={[hS.markAllBtn, {backgroundColor : dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'}]}>
              <Ionicons name="checkmark-done" size={15} color={ dark ? "#3b82f6" : "#3b82f6"} />
              <Text style={[hS.markAllText, {color : dark ? "#3b82f6": "#3b82f6"}]}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* ── List ── */}
      <FlatList
        data={grouped}
        keyExtractor={item => item[0]}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 80,
          flexGrow: 1,
        }}
        renderItem={({ item }) => {
          const [dateKey, items] = item as [string, Notification[]];
          return (
            <View style={{ marginBottom: 22 }}>
              {/* Group date header */}
              <View style={gS.dateRow}>
                <View style={[gS.dateLine, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]} />
                <Text style={[gS.dateLabel, { color: t.groupDate }]}>
                  {formatGroupDate(dateKey)}
                </Text>
                <View style={[gS.dateLine, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]} />
              </View>

              {items.map(notif => (
                <NotificationCard
                  key={notif.id}
                  item={notif}
                  anim={fadeAnim}
                  onPress={handleOpenNotification}
                  onMarkRead={handleMarkRead}
                  dark={dark}
                />
              ))}
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotifications(true)}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={
          <View style={eS.wrap}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={[eS.title, { color: t.emptyTitle }]}>All caught up!</Text>
            <Text style={[eS.sub, { color: t.emptyText }]}>
              No notifications yet. We{`'`}ll let you know when something happens.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const hS = StyleSheet.create({
  hero:       { paddingHorizontal: 16, paddingBottom: 18 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  sub:        { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginTop: 1 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.4)' },
  markAllText:{ color: '#fff', fontSize: 12, fontWeight: '600' },
});

const nS = StyleSheet.create({
  card:       { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, marginBottom: 10, alignItems: 'flex-start', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  iconWrap:   { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  title:      { fontSize: 14, fontWeight: '800', flex: 1 },
  markReadBtn:{ backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  markReadText:{ fontSize: 10, fontWeight: '600', color: '#3b82f6' },
  message:    { fontSize: 12, lineHeight: 18 },
  bottomRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  time:       { fontSize: 11, fontWeight: '500' },
  urgentBadge:{ backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  urgentText: { fontSize: 10, fontWeight: '700', color: '#ef4444' },
  dot:        { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
});

const gS = StyleSheet.create({
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dateLine: { flex: 1, height: 1 },
  dateLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});

const eS = StyleSheet.create({
  wrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sub:   { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});