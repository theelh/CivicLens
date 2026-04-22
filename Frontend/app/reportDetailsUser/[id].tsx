import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';

import * as Location from "expo-location";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Media {
  id: number;
  type: string;
  file_path: string;
}

interface Location {
  id: number;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

interface AiAnalysis {
  predicted_category: string | null;
  severity_level: string | null;
  confidence_score: number | null;
  sentiment: string | null;
}

interface Report {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  ai_summary: string | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string; icon?: string } | null;
  status:   { id: number; name: string } | null;
  location: Location | null;
  media: Media[];
  ai_analysis: AiAnalysis | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.1.14:8000';
const { width } = Dimensions.get('window');

const SEVERITY_META: Record<string, { bg: string; light: string; label: string; icon: string }> = {
  high:   { bg: '#ef4444', light: '#fef2f2', label: 'High',   icon: '🔴' },
  medium: { bg: '#f59e0b', light: '#fffbeb', label: 'Medium', icon: '🟡' },
  low:    { bg: '#10b981', light: '#f0fdf4', label: 'Low',    icon: '🟢' },
};

const STATUS_META: Record<string, { bg: string; text: string }> = {
  'Submitted':     { bg: '#f1f5f9', text: '#64748b' },
  'AI Processing': { bg: '#ede9fe', text: '#7c3aed' },
  'Assigned':      { bg: '#dbeafe', text: '#2563eb' },
  'In Progress':   { bg: '#fef9c3', text: '#b45309' },
  'Resolved':      { bg: '#dcfce7', text: '#16a34a' },
  'Closed':        { bg: '#f1f5f9', text: '#475569' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getAddressFromCoords = async (lat: any, lng: any) => {
  try {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      console.log("Invalid coords:", lat, lng);
      return null;
    }

    const res = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!res.length) return null;

    const place = res[0];

    return {
      address: place.street || place.name || '',
      city: place.city || place.region || '',
      country: place.country || '',
    };
  } catch (e) {
    console.log('Geocoding error:', e);
    return null;
  }
};


// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoS.row}>
      <View style={infoS.iconWrap}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={infoS.label}>{label}</Text>
        <Text style={infoS.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoS = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  iconWrap:{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' },
  label:   { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 },
  value:   { fontSize: 14, fontWeight: '600', color: '#0f172a' },
});

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={secS.card}>
      <Text style={secS.title}>{title}</Text>
      {children}
    </View>
  );
}

const secS = StyleSheet.create({
  card:  { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  title: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function ReportDetail() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [report, setReport]     = useState<Report | null>(null);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const [geoLocation, setGeoLocation] = useState<{
  address: string;
  city: string;
  country: string;
} | null>(null);


  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch report ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/reports/${id}/user`);
        const rep = res.data.report;

      setReport(rep);

      await Location.requestForegroundPermissionsAsync();
      // 🔥 If location is missing → generate it
      if (
        rep.location?.latitude &&
        rep.location?.longitude
      ) {
        const geo = await getAddressFromCoords(
          Number(rep.location.latitude),
          Number(rep.location.longitude)
        );
        // console.log('Geocoded location:', geo);
        setGeoLocation(geo);
      }
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
      } catch (e) {
        Alert.alert('Error', 'Could not load report.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      "This action can't be undone. Are you sure?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/reports/${id}/destroy`);
              Alert.alert('Deleted', 'Report has been removed.');
              router.replace('/dashboard');
            } catch {
              Alert.alert('Error', 'Failed to delete report.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ── Re-analyze ──────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await api.post(`/reports/${id}/analyze`);
      Alert.alert('✅ Queued', 'AI analysis has been started. Check back shortly.');
    } catch {
      Alert.alert('Error', 'Failed to queue analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500' }}>Loading report…</Text>
      </LinearGradient>
    );
  }

  if (!report) return null;

  const sev      = SEVERITY_META[report.severity]       ?? SEVERITY_META.low;
  const status   = STATUS_META[report.status?.name ?? ''] ?? { bg: '#f1f5f9', text: '#64748b' };
  const images   = report.media?.filter(m => m.type === 'image') ?? [];
  const audios   = report.media?.filter(m => m.type === 'audio') ?? [];
  const confPct  = report.ai_confidence ? Math.round(report.ai_confidence * 100) : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* ── Hero image + back button ── */}
          <View style={{ position: 'relative' }}>
            {images.length > 0 ? (
              <>
                <Image
                  source={{ uri: `${BASE_URL}/storage/${images[imgIndex].file_path}` }}
                  style={heroS.image}
                />
                {/* Image count */}
                {images.length > 1 && (
                  <View style={heroS.imgCount}>
                    <Text style={heroS.imgCountText}>{imgIndex + 1}/{images.length}</Text>
                  </View>
                )}
                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={heroS.thumbStrip}>
                    {images.map((img, i) => (
                      <TouchableOpacity key={img.id} onPress={() => setImgIndex(i)}>
                        <Image
                          source={{ uri: `${BASE_URL}/storage/${img.file_path}` }}
                          style={[heroS.thumb, i === imgIndex && heroS.thumbActive]}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            ) : (
              <LinearGradient colors={['#1e3a5f', '#0c1628']} style={heroS.imagePlaceholder}>
                <Text style={{ fontSize: 48 }}>📷</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8, fontSize: 13 }}>No photo attached</Text>
              </LinearGradient>
            )}

            {/* Gradient overlay at bottom of image */}
            <LinearGradient
              colors={['transparent', 'rgba(248,250,252,0.95)']}
              style={heroS.imageOverlay}
            />

            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={[heroS.backBtn, { top: insets.top + 12 }]}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Owner action buttons (top right) */}
              <View style={[heroS.ownerActions, { top: insets.top + 12 }]}>
                <TouchableOpacity
                  style={heroS.actionBtn}
                  onPress={() => router.push(`/reportsEdit/${id}`)}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[heroS.actionBtn, { backgroundColor: 'rgba(239,68,68,0.85)' }]}
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Ionicons name="trash-outline" size={18} color="#fff" />
                  }
                </TouchableOpacity>
              </View>
          </View>

          {/* ── Content ── */}
          <View style={{ paddingHorizontal: 16, marginTop: -20 }}>

            {/* Title + meta pills */}
            <View style={contentS.titleCard}>
              <View style={contentS.pillRow}>
                <View style={[contentS.pill, { backgroundColor: sev.bg }]}>
                  <Text style={contentS.pillText}>{sev.icon} {sev.label} Severity</Text>
                </View>
                <View style={[contentS.pill, { backgroundColor: status.bg }]}>
                  <Text style={[contentS.pillText, { color: status.text }]}>
                    {report.status?.name ?? 'Submitted'}
                  </Text>
                </View>
              </View>

              <Text style={contentS.title}>{report.title ?? `Report #${report.id}`}</Text>

              <View style={contentS.metaRow}>
                <Text style={contentS.metaText}>#{report.id}</Text>
                <Text style={contentS.metaDot}>·</Text>
                <Text style={contentS.metaText}>{formatDate(report.created_at)}</Text>
              </View>
            </View>

            {/* Description */}
            <SectionCard title="📝 Description">
              <Text style={descS.text}>
                {report.description || 'No description provided.'}
              </Text>
            </SectionCard>

            {/* Details */}
            <SectionCard title="📋 Report Details">
              {report.category && (
                <InfoRow icon={report.category.icon ?? '📌'} label="Category" value={report.category.name} />
              )}
              {report.location && (
                <InfoRow
                  icon="📍"
                  label="Location"
                  value={
                    report.location?.address
                      ? [report.location.city, report.location.address, report.location.country]
                          .filter(Boolean)
                          .join(', ')
                      : geoLocation
                      ? [geoLocation.city, geoLocation.address, geoLocation.country]
                          .filter(Boolean)
                          .join(', ')
                      : 'Location not available'
                  }
                />
              )}
              <InfoRow icon="📅" label="Submitted"    value={formatDate(report.created_at)} />
              <InfoRow icon="🔄" label="Last Updated" value={formatDate(report.updated_at)} />
            </SectionCard>

            {/* AI Analysis */}
            <SectionCard title="🤖 AI Analysis">
              {report.ai_summary ? (
                <View style={{ gap: 12 }}>
                  {/* Summary */}
                  <View style={aiS.summaryBox}>
                    <Text style={aiS.summaryLabel}>Summary</Text>
                    <Text style={aiS.summaryText}>{report.ai_summary}</Text>
                  </View>

                  {/* Confidence bar */}
                  {confPct !== null && (
                    <View>
                      <View style={aiS.confHeader}>
                        <Text style={aiS.confLabel}>AI Confidence</Text>
                        <Text style={[aiS.confPct, {
                          color: confPct >= 80 ? '#10b981' : confPct >= 60 ? '#f59e0b' : '#ef4444'
                        }]}>{confPct}%</Text>
                      </View>
                      <View style={aiS.barBg}>
                        <View style={[aiS.barFill, {
                          width: `${confPct}%` as any,
                          backgroundColor: confPct >= 80 ? '#10b981' : confPct >= 60 ? '#f59e0b' : '#ef4444',
                        }]} />
                      </View>
                    </View>
                  )}

                  {/* ai_analysis details */}
                  {report.ai_analysis && (
                    <View style={aiS.detailGrid}>
                      {report.ai_analysis.predicted_category && (
                        <View style={aiS.detailChip}>
                          <Text style={aiS.detailChipLabel}>Category</Text>
                          <Text style={aiS.detailChipValue}>{report.ai_analysis.predicted_category}</Text>
                        </View>
                      )}
                      {report.ai_analysis.severity_level && (
                        <View style={aiS.detailChip}>
                          <Text style={aiS.detailChipLabel}>Severity</Text>
                          <Text style={aiS.detailChipValue}>{report.ai_analysis.severity_level}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={aiS.empty}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                  <Text style={aiS.emptyTitle}>No AI analysis yet</Text>
                  <Text style={aiS.emptyText}>Run the AI engine to get automatic category detection, severity scoring and a summary.</Text>
                   
                    <TouchableOpacity
                      onPress={handleAnalyze}
                      disabled={analyzing}
                      style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', width: '100%' }}
                    >
                      <LinearGradient colors={['#818cf8', '#6366f1']} style={aiS.analyzeBtn}>
                        <Text style={aiS.analyzeBtnText}>
                          {analyzing ? '⏳ Running…' : '🤖 Run AI Analysis'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                </View>
              )}
            </SectionCard>

            {/* Audio recordings */}
            {audios.length > 0 && (
              <SectionCard title="🎤 Voice Recording">
                <Text style={{ fontSize: 13, color: '#64748b' }}>
                  {audios.length} audio file{audios.length > 1 ? 's' : ''} attached.
                  Open the web dashboard to play recordings.
                </Text>
              </SectionCard>
            )}

          </View>
        </ScrollView>
      </Animated.View>

      {/* ── Owner bottom action bar ── */}
        <View style={[bottomS.bar, { paddingBottom: insets.bottom + 12 }]}>
          {/* Re-analyze */}
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={analyzing}
            style={[bottomS.btn, bottomS.btnSecondary]}
          >
            <Ionicons name="refresh-outline" size={18} color="#6366f1" />
            <Text style={[bottomS.btnText, { color: '#6366f1' }]}>
              {analyzing ? 'Analyzing…' : 'Re-analyze'}
            </Text>
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            onPress={() => router.push(`/reportsEdit/${id}`)}
            style={[bottomS.btn, { flex: 1, overflow: 'hidden', borderRadius: 14 }]}
          >
            <LinearGradient colors={['#38bdf8', '#0284c7']} style={bottomS.btnGrad}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={[bottomS.btnText, { color: '#fff' }]}>Edit Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const heroS = StyleSheet.create({
  image:         { width: '100%', height: 300 },
  imagePlaceholder: { width: '100%', height: 240, justifyContent: 'center', alignItems: 'center' },
  imageOverlay:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  imgCount:      { position: 'absolute', bottom: 90, right: 14, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  imgCountText:  { color: '#fff', fontSize: 12, fontWeight: '600' },
  thumbStrip:    { position: 'absolute', bottom: 10, left: 0, right: 0, paddingHorizontal: 12 },
  thumb:         { width: 52, height: 52, borderRadius: 10, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  thumbActive:   { borderColor: '#0ea5e9' },
  backBtn:       { position: 'absolute', left: 14, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  ownerActions:  { position: 'absolute', right: 14, flexDirection: 'row', gap: 8 },
  actionBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
});

const contentS = StyleSheet.create({
  titleCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  pillRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
  pill:      { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  pillText:  { fontSize: 11, fontWeight: '700', color: '#fff' },
  title:     { fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: -0.3, lineHeight: 28, marginBottom: 8 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:  { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  metaDot:   { fontSize: 12, color: '#cbd5e1' },
});

const descS = StyleSheet.create({
  text: { fontSize: 14, color: '#475569', lineHeight: 22 },
});

const aiS = StyleSheet.create({
  summaryBox:     { backgroundColor: '#f0f9ff', borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#0ea5e9' },
  summaryLabel:   { fontSize: 10, fontWeight: '700', color: '#0ea5e9', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' },
  summaryText:    { fontSize: 13, color: '#1e3a5f', lineHeight: 20 },
  confHeader:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  confLabel:      { fontSize: 12, fontWeight: '600', color: '#64748b' },
  confPct:        { fontSize: 13, fontWeight: '800' },
  barBg:          { height: 6, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'hidden' },
  barFill:        { height: '100%', borderRadius: 10 },
  detailGrid:     { flexDirection: 'row', gap: 10 },
  detailChip:     { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  detailChipLabel:{ fontSize: 10, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  detailChipValue:{ fontSize: 13, fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' },
  empty:          { alignItems: 'center', paddingVertical: 20 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  emptyText:      { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19 },
  analyzeBtn:     { paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  analyzeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

const bottomS = StyleSheet.create({
  bar:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 10 },
  btn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14 },
  btnSecondary:{ backgroundColor: '#ede9fe', flex: 1 },
  btnGrad:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  btnText:     { fontSize: 14, fontWeight: '700' },
});