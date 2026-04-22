import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
  StatusBar,
  useColorScheme,
} from 'react-native';
import api from '@/services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useAuth } from '@/context/AuthContext';
import AIChatWidget from '../ChatbotFAB';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Media { id: number; type: string; file_path: string; }
interface Report {
  id: number; title: string; description: string; media?: Media[];
  category: { id: number; name: string; icon?: string };
  status: { id: number; name: string };
  severity: 'low' | 'medium' | 'high';
  created_at: string; ai_summary?: string;
}

// ── Theme ─────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:          '#f8fafc',
  card:        '#ffffff',
  cardBorder:  '#f1f5f9',
  text:        '#0f172a',
  textSub:     '#64748b',
  textMuted:   '#94a3b8',
  filterBg:    '#ffffff',
  filterChip:  '#f1f5f9',
  chipText:    '#64748b',
  divider:     '#e2e8f0',
  searchBg:    'rgba(255,255,255,0.12)',
  inputBorder: 'rgba(255,255,255,0.18)',
  statCard:    '#ffffff',
  aiSnippet:   '#f0f9ff',
  aiText:      '#475569',
  viewBtn:     '#e2e8f0',
  viewBtnText: '#475569',
};

const DARK = {
  bg:          '#080c14',
  card:        '#111827',
  cardBorder:  'rgba(255,255,255,0.07)',
  text:        '#f1f5f9',
  textSub:     '#94a3b8',
  textMuted:   '#64748b',
  filterBg:    '#111827',
  filterChip:  '#1e293b',
  chipText:    '#94a3b8',
  divider:     'rgba(255,255,255,0.08)',
  searchBg:    'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.12)',
  statCard:    '#1e293b',
  aiSnippet:   'rgba(14,165,233,0.1)',
  aiText:      '#94a3b8',
  viewBtn:     '#1e293b',
  viewBtnText: '#94a3b8',
};

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.1.14:8000';

const SEVERITY_META: Record<string, { bg: string; label: string }> = {
  high:   { bg: '#ef4444', label: 'High'   },
  medium: { bg: '#f59e0b', label: 'Medium' },
  low:    { bg: '#10b981', label: 'Low'    },
};

const STATUS_META: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'Submitted':     { bg: '#f1f5f9', text: '#64748b', darkBg: '#1e293b', darkText: '#94a3b8' },
  'AI Processing': { bg: '#ede9fe', text: '#7c3aed', darkBg: 'rgba(124,58,237,0.15)', darkText: '#a78bfa' },
  'Assigned':      { bg: '#dbeafe', text: '#2563eb', darkBg: 'rgba(37,99,235,0.15)',  darkText: '#60a5fa' },
  'In Progress':   { bg: '#fef9c3', text: '#b45309', darkBg: 'rgba(180,83,9,0.15)',   darkText: '#fbbf24' },
  'Resolved':      { bg: '#dcfce7', text: '#16a34a', darkBg: 'rgba(22,163,74,0.15)',  darkText: '#4ade80' },
  'Closed':        { bg: '#f1f5f9', text: '#475569', darkBg: '#1e293b',               darkText: '#64748b' },
};

const SEV_FILTERS    = ['All', 'High', 'Medium', 'Low'];
const STATUS_FILTERS = ['All', 'Assigned', 'Resolved', 'Closed'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getImage = (item: Report) => {
  const media = item.media?.find(m => m.type === 'image');
  return media
    ? `${BASE_URL}/storage/${media.file_path}`
    : 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80';
};

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, accent, dark }: {
  value: number | string; label: string; icon: string; accent: string; dark: boolean;
}) {
  const t = dark ? DARK : LIGHT;
  return (
    <View style={[statS.card, {
      backgroundColor: t.statCard,
      borderColor: dark ? 'rgba(255,255,255,0.06)' : accent + '25',
    }]}>
      <View style={[statS.iconWrap, { backgroundColor: accent + '22' }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={[statS.value, { color: accent }]}>{value}</Text>
      <Text style={[statS.label, { color: t.textMuted }]}>{label}</Text>
    </View>
  );
}

const statS = StyleSheet.create({
  card:    { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', gap: 5, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  iconWrap:{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  value:   { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  label:   { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
});

// ── Report card ───────────────────────────────────────────────────────────────
function ReportCard({ item, onPress, loadingId, anim, dark }: {
  item: Report; onPress: (id: number) => void;
  loadingId: number | null; anim: Animated.Value; dark: boolean;
}) {
  const t      = dark ? DARK : LIGHT;
  const sev    = SEVERITY_META[item.severity] ?? SEVERITY_META.low;
  const statusDef = STATUS_META[item.status?.name] ?? STATUS_META['Submitted'];
  const statusBg   = dark ? statusDef.darkBg   : statusDef.bg;
  const statusText = dark ? statusDef.darkText  : statusDef.text;

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
    }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item.id)}
        style={[cardS.card, {
          backgroundColor: t.card,
          borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.1)',
          shadowColor: dark ? '#000' : '#0ea5e9',
        }]}
      >
        {/* Image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: getImage(item) }} style={cardS.image} />
          <View style={[cardS.sevBadge, { backgroundColor: sev.bg }]}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' }} />
            <Text style={cardS.sevText}>{sev.label}</Text>
          </View>
          {item.category && (
            <View style={cardS.catBadge}>
              <Text style={cardS.catText}>{item.category.icon ?? '📌'} {item.category.name}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={cardS.body}>
          <View style={cardS.titleRow}>
            <Text style={[cardS.title, { color: t.text }]} numberOfLines={2}>
              {item.title ?? `Report #${item.id}`}
            </Text>
            <Text style={[cardS.time, { color: t.textMuted }]}>{timeAgo(item.created_at)}</Text>
          </View>

          <View style={[cardS.statusPill, { backgroundColor: statusBg }]}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: statusText }} />
            <Text style={[cardS.statusText, { color: statusText }]}>{item.status?.name ?? 'Submitted'}</Text>
          </View>

          {item.ai_summary && (
            <View style={[cardS.aiSnippet, { backgroundColor: t.aiSnippet, borderLeftColor: dark ? '#0ea5e9' : '#0ea5e9' }]}>
              <Text style={cardS.aiLabel}>🤖 AI Summary</Text>
              <Text style={[cardS.aiText, { color: t.aiText }]} numberOfLines={2}>{item.ai_summary}</Text>
            </View>
          )}

          <View style={cardS.footer}>
            <TouchableOpacity
              style={[cardS.viewBtn, { backgroundColor: t.viewBtn, borderColor: t.divider }]}
              onPress={() => onPress(item.id)}
            >
              <Text style={[cardS.viewBtnText, { color: t.viewBtnText }]}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cardS = StyleSheet.create({
  card:       { borderRadius: 22, marginBottom: 16, overflow: 'hidden', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5, borderWidth: 1 },
  image:      { width: '100%', height: 190 },
  sevBadge:   { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  sevText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  catBadge:   { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  catText:    { color: '#fff', fontSize: 11, fontWeight: '600' },
  body:       { padding: 16, gap: 10 },
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title:      { flex: 1, fontSize: 16, fontWeight: '800', letterSpacing: 0.1, lineHeight: 22 },
  time:       { fontSize: 11, fontWeight: '500', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600' },
  aiSnippet:  { borderRadius: 12, padding: 10, borderLeftWidth: 3 },
  aiLabel:    { fontSize: 10, fontWeight: '700', color: '#0ea5e9', marginBottom: 3, letterSpacing: 0.4 },
  aiText:     { fontSize: 12, lineHeight: 17 },
  footer:     { flexDirection: 'row', gap: 10, marginTop: 2 },
  viewBtn:    { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  viewBtnText:{ fontSize: 13, fontWeight: '700' },
});

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const dark        = colorScheme === 'dark';
  const t           = dark ? DARK : LIGHT;

  const { logout, isAuthenticated } = useAuth();

  const [reports, setReports]             = useState<Report[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [loadingId, setLoadingId]         = useState<number | null>(null);
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setFilter]         = useState('All');
  const [activeStatus, setStatus]         = useState('All');
  const [showSearch, setShowSearch]       = useState(false);

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // ── Debounce search ─────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchReports = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports ?? []);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchReports(); }, []);

  // ── Toggle search ───────────────────────────────────────────────────────────
  const toggleSearch = () => {
    const next = !showSearch;
    setShowSearch(next);
    Animated.timing(searchAnim, { toValue: next ? 1 : 0, duration: 220, useNativeDriver: false }).start();
    if (!next) setSearch('');
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return reports.filter(r => {
      const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.category?.name?.toLowerCase().includes(q);
      const matchSev    = activeFilter === 'All' || r.severity === activeFilter.toLowerCase();
      const matchStatus = activeStatus === 'All' || r.status?.name === activeStatus;
      return matchSearch && matchSev && matchStatus;
    });
  }, [reports, debouncedSearch, activeFilter, activeStatus]);

  const stats = useMemo(() => ({
    total:    reports.length,
    resolved: reports.filter(r => r.status?.name === 'Resolved').length,
    urgent:   reports.filter(r => r.severity === 'high').length,
    analyzed: reports.filter(r => !!r.ai_summary).length,
  }), [reports]);

  // ── Analyze ─────────────────────────────────────────────────────────────────
  const handleAnalyze = async (id: number) => {
    try {
      setLoadingId(id);
      await api.post(`/reports/${id}/analyze`);
      Alert.alert('✅ Success', 'AI analysis has been queued.');
    } catch (e: any) {
      Alert.alert('❌ Error', e.response?.data?.message ?? 'Failed to start analysis.');
    } finally { setLoadingId(null); }
  };

  

  // ── List header (memoized) ──────────────────────────────────────────────────
  const ListHeader = useMemo(() => (
    <View>
      {/* Hero gradient */}
      <LinearGradient
        colors={dark ? ['#080c14', '#2369A4'] : ['#2369A4', '#0f172a']}
        style={[headerS.hero, { paddingTop: insets.top + 16 }]}
      >
        {/* Top row */}
        <View style={headerS.topRow}>
          <View>
            <Text style={headerS.greeting}>Good day 👋</Text>
            <Text style={headerS.title}>My Reports</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={toggleSearch} style={headerS.iconBtn}>
              <Ionicons name={showSearch ? 'close' : 'search'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={headerS.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} style={headerS.iconBtn}>
              <Ionicons name="person-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => { await logout(); router.push('/'); }}
              style={headerS.iconBtn}
            >
              <SimpleLineIcons name="logout" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <Animated.View style={{
          height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }),
          opacity: searchAnim,
          overflow: 'hidden',
          marginBottom: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
        }}>
          <View style={headerS.searchWrap}>
            <Ionicons name="search" size={15} color="#94a3b8" />
            <TextInput
              style={headerS.searchInput}
              placeholder="Search by title or category…"
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              autoFocus={showSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={15} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={headerS.statsRow}>
          <StatCard value={stats.total}    label="Total"    icon="📋" accent="#0ea5e9" dark={dark} />
          <StatCard value={stats.resolved} label="Resolved" icon="✅" accent="#10b981" dark={dark} />
          <StatCard value={stats.urgent}   label="Urgent"   icon="🚨" accent="#ef4444" dark={dark} />
          <StatCard value={stats.analyzed} label="AI Done"  icon="🤖" accent="#8b5cf6" dark={dark} />
        </View>
      </LinearGradient>

      {/* Filter bar */}
      <View style={[filterS.wrap, { backgroundColor: t.filterBg, borderBottomColor: t.divider }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={filterS.scroll}>
          {SEV_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[filterS.chip, { backgroundColor: t.filterChip }, activeFilter === f && filterS.chipActive]}
            >
              <Text style={[filterS.chipText, { color: t.chipText }, activeFilter === f && filterS.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={[filterS.divider, { backgroundColor: t.divider }]} />
          {STATUS_FILTERS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[filterS.chip, { backgroundColor: t.filterChip }, activeStatus === s && filterS.chipActive]}
            >
              <Text style={[filterS.chipText, { color: t.chipText }, activeStatus === s && filterS.chipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[filterS.count, { color: t.textMuted }]}>
          {filtered.length} report{filtered.length !== 1 ? 's' : ''}
          {(activeFilter !== 'All' || activeStatus !== 'All' || search) ? ' — filtered' : ''}
        </Text>
      </View>
    </View>
  ), [search, showSearch, activeFilter, activeStatus, stats, dark, filtered.length]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  const ListEmpty = useCallback(() => (
    <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: t.text, marginBottom: 8 }}>No reports found</Text>
      <Text style={{ fontSize: 14, color: t.textSub, textAlign: 'center', lineHeight: 21 }}>
        {search || activeFilter !== 'All' || activeStatus !== 'All'
          ? 'Try adjusting your filters or search term.'
          : 'Submit your first city report and help improve your neighbourhood.'}
      </Text>
      {!search && activeFilter === 'All' && activeStatus === 'All' && (
        <TouchableOpacity
          style={{ marginTop: 24, borderRadius: 14, overflow: 'hidden', width: '100%' }}
          onPress={() => router.push('/submitReport')}
        >
          <LinearGradient colors={['#38bdf8', '#0284c7']} style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 14 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Submit a Report</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  ), [t, search, activeFilter, activeStatus]);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (!isAuthenticated && !loading) {
    router.replace('/(auth)/login');
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500' }}>Loading your reports…</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        renderItem={({ item }) => (
          <ReportCard
            item={item}
            onPress={id => router.push(`/reportDetails/${id}`)}
            loadingId={loadingId}
            anim={fadeAnim}
            dark={dark}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<ListEmpty />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReports(true)}
            tintColor="#0ea5e9"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={fabS.fab}
        onPress={() => router.push('/submitReport')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#38bdf8', '#0284c7']} style={fabS.grad}>
          <Ionicons name="add" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <AIChatWidget />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const headerS = StyleSheet.create({
  hero:       { paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom:10 },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting:   { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginBottom: 2 },
  title:      { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  iconBtn:    { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  searchInput:{ flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  statsRow:   { flexDirection: 'row', gap: 8, marginTop: 4 },
});

const filterS = StyleSheet.create({
  wrap:          { paddingBottom: 6, marginBottom: 14, borderBottomWidth: 1 },
  scroll:        { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip:          { borderRadius: 100, paddingHorizontal: 13, paddingVertical: 6 },
  chipActive:    { backgroundColor: '#0ea5e9' },
  chipText:      { fontSize: 12, fontWeight: '600' },
  chipTextActive:{ color: '#fff' },
  divider:       { width: 1, marginHorizontal: 4 },
  count:         { paddingHorizontal: 16, paddingBottom: 4, fontSize: 11, fontWeight: '500' },
});

const fabS = StyleSheet.create({
  fab:  { position: 'absolute', bottom: 28, right: 20, borderRadius: 20, overflow: 'hidden', shadowColor: '#0ea5e9', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10 },
  grad: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
});