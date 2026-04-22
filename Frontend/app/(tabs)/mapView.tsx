import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '@/services/api';

// ── Types
interface ReportPin {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: string;
  category: string;
  category_icon: string;
  latitude: number;
  longitude: number;
  address: string;
  ai_summary?: string;
  created_at: string;
}

interface GeoSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

// ── Theme
const LIGHT = {
  bg:           '#f8fafc',
  surface:      '#ffffff',
  border:       '#e2e8f0',
  text:         '#0f172a',
  textSub:      '#64748b',
  textMuted:    '#94a3b8',
  chip:         '#f1f5f9',
  chipText:     '#64748b',
  inputBg:      '#ffffff',
  inputBorder:  '#e2e8f0',
  pill:         'rgba(255,255,255,0.95)',
  shadow:       '#000',
};

const DARK = {
  bg:           '#080c14',
  surface:      '#111827',
  border:       'rgba(255,255,255,0.08)',
  text:         '#f1f5f9',
  textSub:      '#94a3b8',
  textMuted:    '#64748b',
  chip:         '#1e293b',
  chipText:     '#94a3b8',
  inputBg:      '#1e293b',
  inputBorder:  'rgba(255,255,255,0.1)',
  pill:         'rgba(17,24,39,0.96)',
  shadow:       '#000',
};

// ── Severity coloursf
const SEV: Record<string, { pin: string; light: string; label: string }> = {
  high:   { pin: '#ef4444', light: 'rgba(239,68,68,0.15)',   label: 'High'   },
  medium: { pin: '#f59e0b', light: 'rgba(245,158,11,0.15)',  label: 'Medium' },
  low:    { pin: '#10b981', light: 'rgba(16,185,129,0.15)',  label: 'Low'    },
};

const STATUS_COLORS: Record<string, string> = {
  'Submitted':     '#64748b',
  'AI Processing': '#8b5cf6',
  'Assigned':      '#3b82f6',
  'In Progress':   '#f59e0b',
  'Resolved':      '#10b981',
  'Closed':        '#475569',
};

const SEV_FILTERS    = ['All', 'High', 'Medium', 'Low'];
const STATUS_FILTERS = ['All', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

const { width, height } = Dimensions.get('window');

// ── Google Maps dark style
const DARK_MAP_STYLE = [
  { elementType: 'geometry',       stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road',           elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road',           elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road.highway',   elementType: 'geometry', stylers: [{ color: '#2369A4' }] },
  { featureType: 'water',          elementType: 'geometry', stylers: [{ color: '#0c1a2e' }] },
  { featureType: 'poi',            stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',        stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'landscape',      elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
];

// ── Helpers
const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Custom map marker
function PinMarker({ report, onPress, selected }: {
  report: ReportPin; onPress: () => void; selected: boolean;
}) {
  const sev = SEV[report.severity] ?? SEV.low;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.3 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [selected]);

  return (
    <Marker
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <Animated.View style={[pinS.wrap, { transform: [{ scale }] }]}>
        <View style={[pinS.outer, { backgroundColor: sev.pin, borderColor: selected ? '#fff' : sev.pin }]}>
          <Text style={pinS.emoji}>{report.category_icon || '📌'}</Text>
        </View>
        <View style={[pinS.tail, { borderTopColor: sev.pin }]} />
      </Animated.View>
    </Marker>
  );
}

const pinS = StyleSheet.create({
  wrap:  { alignItems: 'center' },
  outer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  emoji: { fontSize: 18 },
  tail:  { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
});

// ── Report bottom card
function ReportCard({ report, onClose, onView, dark }: {
  report: ReportPin; onClose: () => void; onView: () => void; dark: boolean;
}) {
  const t   = dark ? DARK : LIGHT;
  const sev = SEV[report.severity] ?? SEV.low;
  const statusColor = STATUS_COLORS[report.status] ?? '#64748b';
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }).start();
  }, [report.id]);

  return (
    <Animated.View style={[rcS.card, { backgroundColor: t.surface, borderColor: t.border, transform: [{ translateY: slideAnim }] }]}>
      {/* Header */}
      <View style={rcS.header}>
        <View style={[rcS.sevBadge, { backgroundColor: sev.light }]}>
          <View style={[rcS.sevDot, { backgroundColor: sev.pin }]} />
          <Text style={[rcS.sevText, { color: sev.pin }]}>{sev.label}</Text>
        </View>
        <View style={[rcS.statusPill, { backgroundColor: statusColor + '20' }]}>
          <Text style={[rcS.statusText, { color: statusColor }]}>{report.status}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={rcS.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={t.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[rcS.title, { color: t.text }]} numberOfLines={2}>
        {report.category_icon} {report.title}
      </Text>

      {/* Location */}
      <View style={rcS.locationRow}>
        <Ionicons name="location-outline" size={13} color={t.textMuted} />
        <Text style={[rcS.locationText, { color: t.textSub }]} numberOfLines={1}>{report.address}</Text>
        <Text style={[rcS.time, { color: t.textMuted }]}>{timeAgo(report.created_at)}</Text>
      </View>

      {/* AI Summary */}
      {report.ai_summary && (
        <View style={[rcS.aiBox, { backgroundColor: dark ? 'rgba(14,165,233,0.1)' : '#f0f9ff' }]}>
          <Text style={rcS.aiLabel}>🤖 AI Summary</Text>
          <Text style={[rcS.aiText, { color: t.textSub }]} numberOfLines={2}>{report.ai_summary}</Text>
        </View>
      )}

      {/* View button */}
      <TouchableOpacity onPress={onView} style={{ borderRadius: 14, overflow: 'hidden', marginTop: 10 }}>
        <LinearGradient colors={['#38bdf8', '#0284c7']} style={rcS.viewBtn}>
          <Text style={rcS.viewBtnText}>View Full Report →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const rcS = StyleSheet.create({
  card:        { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 8, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 12 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sevBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  sevDot:      { width: 5, height: 5, borderRadius: 3 },
  sevText:     { fontSize: 11, fontWeight: '700' },
  statusPill:  { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:  { fontSize: 11, fontWeight: '600' },
  closeBtn:    { marginLeft: 'auto' },
  title:       { fontSize: 17, fontWeight: '800', lineHeight: 23, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  locationText:{ flex: 1, fontSize: 12, fontWeight: '500' },
  time:        { fontSize: 11, fontWeight: '500', marginLeft: 4 },
  aiBox:       { borderRadius: 12, padding: 10, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: '#0ea5e9' },
  aiLabel:     { fontSize: 10, fontWeight: '700', color: '#0ea5e9', marginBottom: 3, letterSpacing: 0.4 },
  aiText:      { fontSize: 12, lineHeight: 17 },
  viewBtn:     { paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
  viewBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

// ── Main component
export default function MapPage() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const dark        = colorScheme === 'dark';
  const t           = dark ? DARK : LIGHT;

  const mapRef = useRef<MapView>(null);

  const [reports, setReports]           = useState<ReportPin[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<ReportPin | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating]         = useState(false);

  // Search
  const [search, setSearch]             = useState('');
  const [suggestions, setSuggestions]   = useState<GeoSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout                   = useRef<ReturnType<typeof setTimeout>>();

  // Filters
  const [sevFilter, setSevFilter]       = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters]   = useState(false);

  // UI anims
  const filterAnim = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;

  // ── Fetch reports
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/map/reports');
        setReports(res.data.reports ?? []);
        Animated.timing(statsAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // ── Filter reports
  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchSev    = sevFilter    === 'All' || r.severity === sevFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchSearch = !search.trim() ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.address.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());
      return matchSev && matchStatus && matchSearch;
    });
  }, [reports, sevFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total:    filtered.length,
    high:     filtered.filter(r => r.severity === 'high').length,
    resolved: filtered.filter(r => r.status === 'Resolved').length,
  }), [filtered]);

  // ── Geocode search (Nominatim)
  const handleSearchInput = (value: string) => {
    setSearch(value);
    setSelected(null);
    clearTimeout(searchTimeout.current);

    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }

    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: GeoSuggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch { setSuggestions([]); }
      finally { setSearchLoading(false); }
    }, 400);
  };

  const flyToSuggestion = (s: GeoSuggestion) => {
    setSearch(s.display_name.split(',')[0]);
    setSuggestions([]);
    setShowSuggestions(false);
    mapRef.current?.animateToRegion({
      latitude:      parseFloat(s.lat),
      longitude:     parseFloat(s.lon),
      latitudeDelta:  0.05,
      longitudeDelta: 0.05,
    }, 800);
  };

  // ── Detect user location
  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      setUserLocation({ latitude, longitude });
      mapRef.current?.animateToRegion({
        latitude, longitude,
        latitudeDelta: 0.02, longitudeDelta: 0.02,
      }, 800);
    } catch (e) { console.error(e); }
    finally { setLocating(false); }
  };

  // ── Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(v => !v);
    Animated.timing(filterAnim, {
      toValue: showFilters ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  // ── Fly to selected report
  const selectReport = (report: ReportPin) => {
    setSelected(report);
    mapRef.current?.animateToRegion({
      latitude:      report.latitude - 0.003,
      longitude:     report.longitude,
      latitudeDelta:  0.015,
      longitudeDelta: 0.015,
    }, 600);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500' }}>Loading map…</Text>
      </LinearGradient>
    );
  }

  const activeFilterCount = (sevFilter !== 'All' ? 1 : 0) + (statusFilter !== 'All' ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle="light-content" />

      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={dark ? DARK_MAP_STYLE : []}
        initialRegion={{
          latitude:      34.0, longitude: -6.8,
          latitudeDelta:  8,   longitudeDelta: 8,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => { setSelected(null); setShowSuggestions(false); }}
      >
        {/* Report pins */}
        {filtered.map(r => (
          <PinMarker
            key={r.id}
            report={r}
            selected={selected?.id === r.id}
            onPress={() => selectReport(r)}
          />
        ))}

        {/* User location pulse */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={300}
            fillColor="rgba(14,165,233,0.15)"
            strokeColor="rgba(14,165,233,0.4)"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* ── Top bar: header + search ── */}
      <View style={[topS.container, { paddingTop: insets.top + 10 }]}>

        {/* Header row */}
        <View style={topS.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[topS.iconBtn, { backgroundColor: t.pill }]}>
            <Ionicons name="arrow-back" size={20} color={t.text} />
          </TouchableOpacity>

          <View style={[topS.titlePill, { backgroundColor: t.pill }]}>
            <Text style={[topS.titleText, { color: t.text }]}>🗺️ City Reports Map</Text>
            <Animated.View style={[topS.countBadge, { opacity: statsAnim }]}>
              <Text style={topS.countText}>{stats.total}</Text>
            </Animated.View>
          </View>

          <TouchableOpacity onPress={toggleFilters} style={[topS.iconBtn, { backgroundColor: activeFilterCount > 0 ? '#0ea5e9' : t.pill }]}>
            <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? '#fff' : t.text} />
            {activeFilterCount > 0 && (
              <View style={topS.filterDot}>
                <Text style={topS.filterDotText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={[topS.searchWrap, { backgroundColor: t.pill, borderColor: t.border }]}>
          {searchLoading
            ? <ActivityIndicator size="small" color="#0ea5e9" />
            : <Ionicons name="search" size={16} color={t.textMuted} />
          }
          <TextInput
            style={[topS.searchInput, { color: t.text }]}
            placeholder="Search city, address, or report…"
            placeholderTextColor={t.textMuted}
            value={search}
            onChangeText={handleSearchInput}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); }}>
              <Ionicons name="close-circle" size={16} color={t.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Geocode suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={[topS.suggestions, { backgroundColor: t.surface, borderColor: t.border }]}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={s.place_id}
                onPress={() => flyToSuggestion(s)}
                style={[topS.suggestionRow, i < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.border }]}
              >
                <Ionicons name="location-outline" size={14} color={t.textMuted} />
                <Text style={[topS.suggestionText, { color: t.text }]} numberOfLines={1}>
                  {s.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filter panel */}
        <Animated.View style={{
          maxHeight: filterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }),
          opacity: filterAnim,
          overflow: 'hidden',
        }}>
          <View style={[fS.panel, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[fS.sectionLabel, { color: t.textMuted }]}>SEVERITY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {SEV_FILTERS.map(f => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setSevFilter(f)}
                    style={[fS.chip, { backgroundColor: t.chip }, sevFilter === f && fS.chipActive]}
                  >
                    {f !== 'All' && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SEV[f.toLowerCase()]?.pin ?? '#94a3b8' }} />}
                    <Text style={[fS.chipText, { color: t.chipText }, sevFilter === f && fS.chipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={[fS.sectionLabel, { color: t.textMuted }]}>STATUS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {STATUS_FILTERS.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatusFilter(s)}
                    style={[fS.chip, { backgroundColor: t.chip }, statusFilter === s && fS.chipActive]}
                  >
                    <Text style={[fS.chipText, { color: t.chipText }, statusFilter === s && fS.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* ── Bottom stats pill ── */}
      {!selected && (
        <Animated.View style={[bS.statsRow, { bottom: insets.bottom + 20, opacity: statsAnim }]}>
          {[
            { label: 'Total',    value: stats.total,    color: '#0ea5e9' },
            { label: 'Urgent',   value: stats.high,     color: '#ef4444' },
            { label: 'Resolved', value: stats.resolved, color: '#10b981' },
          ].map(s => (
            <View key={s.label} style={[bS.statChip, { backgroundColor: t.pill, borderColor: t.border }]}>
              <Text style={[bS.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[bS.statLabel, { color: t.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* ── Locate me button ── */}
      {!selected && (
        <TouchableOpacity
          onPress={detectLocation}
          disabled={locating}
          style={[bS.locateBtn, { bottom: insets.bottom + 90, backgroundColor: t.pill, borderColor: t.border }]}
        >
          {locating
            ? <ActivityIndicator size="small" color="#0ea5e9" />
            : <Ionicons name="navigate" size={20} color="#0ea5e9" />
          }
        </TouchableOpacity>
      )}

      {/* ── Selected report card ── */}
      {selected && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: insets.bottom }}>
          <ReportCard
            report={selected}
            dark={dark}
            onClose={() => setSelected(null)}
            onView={() => router.push(`/reportDetails/${selected.id}`)}
          />
        </View>
      )}
    </View>
  );
}

// ── Styles

const topS = StyleSheet.create({
  container:    { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14, gap: 10, zIndex: 10 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:      { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  titlePill:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 11, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  titleText:    { fontSize: 14, fontWeight: '800' },
  countBadge:   { backgroundColor: '#0ea5e9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  countText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  filterDot:    { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },
  filterDotText:{ color: '#fff', fontSize: 9, fontWeight: '800' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  searchInput:  { flex: 1, fontSize: 14, fontWeight: '500' },
  suggestions:  { borderRadius: 16, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  suggestionRow:{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  suggestionText:{ flex: 1, fontSize: 13, fontWeight: '500' },
});

const fS = StyleSheet.create({
  panel:        { borderRadius: 18, padding: 14, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7 },
  chipActive:   { backgroundColor: '#0ea5e9' },
  chipText:     { fontSize: 12, fontWeight: '600' },
  chipTextActive:{ color: '#fff' },
});

const bS = StyleSheet.create({
  statsRow:  { position: 'absolute', left: 14, right: 14, flexDirection: 'row', gap: 10 },
  statChip:  { flex: 1, borderRadius: 16, paddingVertical: 10, alignItems: 'center', gap: 2, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  statValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  locateBtn: { position: 'absolute', right: 14, width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
});