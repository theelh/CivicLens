import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';
import * as Location from 'expo-location';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  icon?: string;
}

// ── Severity config ───────────────────────────────────────────────────────────
const SEVERITY_OPTIONS = [
  { value: 'low',    label: 'Low',    icon: '🟢', color: '#10b981', light: '#f0fdf4', border: '#10b981' },
  { value: 'medium', label: 'Medium', icon: '🟡', color: '#f59e0b', light: '#fffbeb', border: '#f59e0b' },
  { value: 'high',   label: 'High',   icon: '🔴', color: '#ef4444', light: '#fef2f2', border: '#ef4444' },
];

// ── Section card wrapper ──────────────────────────────────────────────────────
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
  title: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
});

// ── Styled input ──────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldS.wrap}>
      <Text style={fieldS.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        multiline={multiline}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          fieldS.input,
          multiline && { height: 110, textAlignVertical: 'top' },
          focused && fieldS.inputFocused,
        ]}
      />
    </View>
  );
}

const fieldS = StyleSheet.create({
  wrap:         { marginBottom: 14 },
  label:        { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input:        { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', backgroundColor: '#f8fafc' },
  inputFocused: { borderColor: '#0ea5e9', backgroundColor: '#fff', shadowColor: '#0ea5e9', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function EditReport() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity]     = useState('low');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage]           = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

// Add these state variables
const [address, setAddress]         = useState('');
const [latitude, setLatitude]       = useState<number | null>(null);
const [longitude, setLongitude]     = useState<number | null>(null);
const [geoLoading, setGeoLoading]   = useState(false);

// Add detect function
const detectLocation = async () => {
  setGeoLoading(true);
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Allow location access to auto-detect.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude: lat, longitude: lng } = pos.coords;
    setLatitude(lat);
    setLongitude(lng);

    // Reverse geocode
    const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (geo.length > 0) {
      const g = geo[0];
      setAddress([g.street, g.city, g.country].filter(Boolean).join(', '));
    }
  } catch {
    Alert.alert('Error', 'Could not detect location.');
  } finally {
    setGeoLoading(false);
  }
};

  // ── Fetch report ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, catRes] = await Promise.all([
          api.get(`/reports/${id}/user`),
          api.get('/categories'),
        ]);
        const r = reportRes.data.report;
        setTitle(r.title ?? '');
        setDescription(r.description ?? '');
        setSeverity(r.severity ?? 'low');
        if (r.location) {
          setAddress([r.location.city, r.location.address].filter(Boolean).join(', '));
          setLatitude(r.location.latitude ?? null);
          setLongitude(r.location.longitude ?? null);
        }

        // Set existing image preview
        const existingImg = r.media?.find((m: any) => m.type === 'image');
        if (existingImg) {
          setCurrentImage(`http://192.168.1.14:8000/storage/${existingImg.file_path}`);
        }

        setCategories(catRes.data.categories ?? catRes.data ?? []);
      } catch {
        Alert.alert('Error', 'Failed to load report');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Pick image ───────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!description.trim()) {
      Alert.alert('Validation', 'Description is required.');
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append('title',       title);
      form.append('description', description);
      form.append('severity',    severity);
      form.append('category_id', categoryId);
      if (latitude)  form.append('latitude',  String(latitude));   // ✅
      if (longitude) form.append('longitude', String(longitude));

      if (image) {
        form.append('image', {
          uri:  image.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await api.post(`/reports/${id}/update?_method=PUT`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('✅ Updated', 'Report updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message ?? 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500' }}>Loading report…</Text>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={['#1e3a5f', '#0f172a']}
        style={[headerS.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={headerS.row}>
          <TouchableOpacity onPress={() => router.back()} style={headerS.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={headerS.subtitle}>Report #{id}</Text>
            <Text style={headerS.title}>Edit Report</Text>
          </View>
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={saving}
            style={[headerS.saveBtn, saving && { opacity: 0.6 }]}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={headerS.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Basic info ── */}
        <SectionCard title="📝 Basic Information">
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Large pothole on main road"
          />
          <Field
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail…"
            multiline
          />
        </SectionCard>

        {/* ── Category ── */}
        {categories.length > 0 && (
          <SectionCard title="🗂️ Category">
            <View style={catS.grid}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoryId(c.id.toString())}
                  style={[
                    catS.chip,
                    categoryId === c.id.toString() && catS.chipActive,
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{c.icon ?? '📌'}</Text>
                  <Text style={[
                    catS.chipText,
                    categoryId === c.id.toString() && catS.chipTextActive,
                  ]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>
        )}

        {/* ── Severity ── */}
        <SectionCard title="⚡ Severity">
          <View style={sevS.row}>
            {SEVERITY_OPTIONS.map(s => {
              const active = severity === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setSeverity(s.value)}
                  style={[
                    sevS.chip,
                    active && { backgroundColor: s.light, borderColor: s.border },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                  <Text style={[sevS.chipText, active && { color: s.color, fontWeight: '700' }]}>
                    {s.label}
                  </Text>
                  {active && (
                    <View style={[sevS.checkDot, { backgroundColor: s.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* ── Photo ── */}
        <SectionCard title="📸 Photo">
          {/* Preview */}
          {(image || currentImage) && (
            <View style={imgS.previewWrap}>
              <Image
                source={{ uri: image ? image.uri : currentImage! }}
                style={imgS.preview}
              />
              {image && (
                <View style={imgS.newBadge}>
                  <Text style={imgS.newBadgeText}>New photo</Text>
                </View>
              )}
              <TouchableOpacity
                style={imgS.removeBtn}
                onPress={() => { setImage(null); if (!currentImage) return; }}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Buttons */}
          <View style={imgS.btnRow}>
            <TouchableOpacity style={imgS.btn} onPress={pickImage}>
              <Ionicons name="images-outline" size={18} color="#0ea5e9" />
              <Text style={imgS.btnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={imgS.btn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={18} color="#0ea5e9" />
              <Text style={imgS.btnText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* ── Location ── */}
       <SectionCard title="📍 Location">
  {/* Address display */}
  <View style={locS.addressBox}>
    <Ionicons name="location" size={18} color="#0ea5e9" />
    <Text style={locS.addressText} numberOfLines={2}>
      {address || 'No location set — tap Detect to use GPS'}
    </Text>
  </View>

  {/* {latitude && longitude && (
    <Text style={locS.coords}>
      GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
    </Text>
  )} */}

  {/* Manual address input */}
  <TextInput
    value={address}
    onChangeText={setAddress}
    placeholder="Or type an address manually…"
    placeholderTextColor="#cbd5e1"
    style={locS.input}
  />

  {/* Detect button */}
  <TouchableOpacity
    onPress={detectLocation}
    disabled={geoLoading}
    style={[locS.detectBtn, geoLoading && { opacity: 0.6 }]}
  >
    <LinearGradient colors={['#38bdf8', '#0284c7']} style={locS.detectGrad}>
      {geoLoading
        ? <ActivityIndicator size="small" color="#fff" />
        : <Ionicons name="navigate" size={16} color="#fff" />
      }
      <Text style={locS.detectText}>
        {geoLoading ? 'Detecting…' : 'Detect My Location'}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
</SectionCard>

      </ScrollView>

      {/* ── Bottom save bar ── */}
      <View style={[bottomS.bar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={bottomS.cancelBtn}
          onPress={() => router.back()}
        >
          <Text style={bottomS.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={saving}
          style={[{ flex: 1, borderRadius: 16, overflow: 'hidden' }, saving && { opacity: 0.65 }]}
        >
          <LinearGradient colors={['#38bdf8', '#0284c7']} style={bottomS.saveBtn}>
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={bottomS.saveText}>Save Changes</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const headerS = StyleSheet.create({
  header:   { paddingHorizontal: 16, paddingBottom: 18 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:  { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500', marginBottom: 1 },
  title:    { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  saveBtn:  { backgroundColor: 'rgba(14,165,233,0.25)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(14,165,233,0.4)' },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const catS = StyleSheet.create({
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#f8fafc' },
  chipActive:   { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  chipText:     { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#0284c7' },
});

const sevS = StyleSheet.create({
  row:      { flexDirection: 'row', gap: 10 },
  chip:     { flex: 1, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, paddingVertical: 14, backgroundColor: '#f8fafc', position: 'relative' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  checkDot: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});

const imgS = StyleSheet.create({
  previewWrap: { position: 'relative', marginBottom: 12 },
  preview:     { width: '100%', height: 200, borderRadius: 16 },
  newBadge:    { position: 'absolute', top: 10, left: 10, backgroundColor: '#10b981', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  newBadgeText:{ color: '#fff', fontSize: 11, fontWeight: '700' },
  removeBtn:   { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  btnRow:      { flexDirection: 'row', gap: 10 },
  btn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#bae6fd', borderRadius: 14, paddingVertical: 12, backgroundColor: '#f0f9ff' },
  btnText:     { fontSize: 13, fontWeight: '600', color: '#0284c7' },
});

const locS = StyleSheet.create({
  addressBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#f0f9ff', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#bae6fd', marginBottom: 10,
  },
  addressText: { flex: 1, fontSize: 13, color: '#0f172a', lineHeight: 19 },
  coords:      { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 10, paddingLeft: 4 },
  input:       { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, color: '#0f172a', backgroundColor: '#f8fafc', marginBottom: 10 },
  detectBtn:   { borderRadius: 14, overflow: 'hidden' },
  detectGrad:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  detectText:  { color: '#fff', fontSize: 14, fontWeight: '700' },
});

const bottomS = StyleSheet.create({
  bar:       { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 10 },
  cancelBtn: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#e2e8f0' },
  cancelText:{ fontSize: 14, fontWeight: '600', color: '#64748b' },
  saveBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  saveText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});