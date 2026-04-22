import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at: string;
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, thems }: {
  title: string; icon: string; children: React.ReactNode, thems: unknown;
}) {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  const theme = {
    bg: dark ? '#0f172a' : '#f8fafc',
    card: dark ? '#1e293b' : '#fff',
    border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#0f172a',
    subText: dark ? '#94a3b8' : '#64748b',
    inputBg: dark ? '#020617' : '#f8fafc',
  };
  return (
    <View style={[secS.card, {
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
      <View style={secS.header}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={[secS.title, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const secS = StyleSheet.create({
  card:   { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  title:  { fontSize: 14, fontWeight: '700', color: '#0f172a' },
});

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label, value, onChangeText, placeholder,
  secureTextEntry = false, keyboardType = 'default', editable = true,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean;
  keyboardType?: any; editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow]       = useState(false);

  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  const theme = {
  bg: dark ? '#0f172a' : '#f8fafc',
  card: dark ? '#1e293b' : '#fff',
  border: dark ? '#334155' : '#e2e8f0',
  text: dark ? '#e2e8f0' : '#0f172a',
  subText: dark ? '#94a3b8' : '#64748b',
  inputBg: dark ? '#020617' : '#f8fafc',
};

  return (
    <View style={fieldS.wrap}>
      <Text style={[fieldS.label, { color: theme.subText }]}>{label}</Text>
      <View style={[
        fieldS.inputWrap,
        {
          backgroundColor: theme.inputBg,
          borderColor: theme.border,
        },
        focused && {
          borderColor: '#0ea5e9',
          backgroundColor: dark ? '#020617' : '#fff',
        },
        !editable && fieldS.inputWrapDisabled,
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[fieldS.input, { color: theme.text }, !editable && { color: '#94a3b8' }]}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(v => !v)} style={fieldS.eye}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const fieldS = StyleSheet.create({
  wrap:             { marginBottom: 14 },
  label:            { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputWrap:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, backgroundColor: '#f8fafc', paddingHorizontal: 14 },
  inputWrapFocused: { borderColor: '#0ea5e9', backgroundColor: '#fff', shadowColor: '#0ea5e9', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  inputWrapDisabled:{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  input:            { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0f172a' },
  eye:              { padding: 4 },
});

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <View style={[toastS.wrap, type === 'success' ? toastS.success : toastS.error]}>
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color="#fff"
      />
      <Text style={toastS.text}>{message}</Text>
    </View>
  );
}

const toastS = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14 },
  success: { backgroundColor: '#10b981' },
  error:   { backgroundColor: '#ef4444' },
  text:    { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
});

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <LinearGradient
      colors={['#38bdf8', '#0284c7']}
      style={[avatarS.wrap, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[avatarS.text, { fontSize: size * 0.35 }]}>{initials}</Text>
    </LinearGradient>
  );
}

const avatarS = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center', shadowColor: '#0ea5e9', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  text: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProfilePage() {

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;


  const { logout } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);

  // Profile form
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword]   = useState(false);

  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  const theme = {
  bg: dark ? '#0f172a' : '#f8fafc',
  card: dark ? '#1e293b' : '#fff',
  border: dark ? '#334155' : '#e2e8f0',
  text: dark ? '#e2e8f0' : '#0f172a',
  subText: dark ? '#94a3b8' : '#64748b',
  inputBg: dark ? '#020617' : '#f8fafc',
};

  // Feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch user ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/settings/profile');
        const u = res.data.user ?? res.data;
        setUser(u);
        setName(u.name ?? '');
        setEmail(u.email ?? '');
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
      } catch {
        Alert.alert('Error', 'Failed to load profile.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Update profile ─────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await api.put('/settings/profile', { name, email });
      setUser(prev => prev ? { ...prev, name, email } : prev);
      showToast('Profile updated successfully.', 'success');
    } catch (e: any) {
      const msg = e.response?.data?.message
        ?? Object.values(e.response?.data?.errors ?? {})[0]
        ?? 'Failed to update profile.';
      showToast(String(msg), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/settings/password', {
        current_password:      currentPassword,
        password:              newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully.', 'success');
    } catch (e: any) {
      const msg = e.response?.data?.message
        ?? Object.values(e.response?.data?.errors ?? {})[0]
        ?? 'Failed to change password.';
      showToast(String(msg), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all your reports. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type your email to confirm deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await api.delete('/settings/profile');
                      router.replace('/login');
                    } catch {
                      showToast('Failed to delete account.', 'error');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.push('/'); // redirect after logout
          } catch { /* silent */ }
          router.replace('/login');
        },
      },
    ]);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500' }}>Loading profile…</Text>
      </LinearGradient>
    );
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={dark ? ['#2369A4', '#0f172a'] : ['#2369A4', '#f8fafc']} // Light gradient colors
        style={[headerS.hero, { paddingTop: insets.top }]}
      >
        <View style={headerS.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={headerS.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[headerS.pageTitle, {color : theme.text}]}>My Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={headerS.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* Avatar section */}
        <Animated.View style={[headerS.avatarSection, { opacity: fadeAnim }]}>
          <Avatar name={name || 'User'} size={80} />
          <View style={headerS.userInfo}>
            <Text style={[headerS.userName, {color: theme.text}]}>{name}</Text>
            <Text style={[headerS.userEmail, {color : theme.subText}]}>{email}</Text>
            <View style={[headerS.metaRow, {color : theme.subText}]}>
              {user?.role && (
                <View style={headerS.roleBadge}>
                  <Text style={[headerS.roleText, {color : theme.subText}]}>{
                    user.role === 'user' ? 'Citizen' :                    
                    user.role
                  } </Text>
                </View>
              )}
              {memberSince && (
                <Text style={[headerS.memberSince, {color : theme.subText}]}>Member since {memberSince}</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Toast ── */}
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* ── Profile info ── */}
        <SectionCard title="Personal Information" icon="👤" thems={theme}>
          <Field
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
          />
          <Field
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
          />

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={savingProfile}
            style={[btnS.primary, savingProfile && { opacity: 0.65 }]}
          >
            <LinearGradient colors={['#38bdf8', '#0284c7']} style={btnS.primaryGrad}>
              {savingProfile
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={btnS.primaryText}>Save Profile</Text>
                  </>
              }
            </LinearGradient>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Password ── */}
        <SectionCard title="Change Password" icon="🔒" thems={theme}>
          <Field
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
          />
          <Field
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />
          <Field
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat new password"
            secureTextEntry
          />

          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <View style={pwdS.strengthWrap}>
              <View style={pwdS.barBg}>
                <View style={[
                  pwdS.barFill,
                  {
                    width: `${Math.min(100, newPassword.length * 8)}%` as any,
                    backgroundColor:
                      newPassword.length < 6 ? '#ef4444' :
                      newPassword.length < 10 ? '#f59e0b' : '#10b981',
                  },
                ]} />
              </View>
              <Text style={[
                pwdS.strengthLabel,
                { color: newPassword.length < 6 ? '#ef4444' : newPassword.length < 10 ? '#f59e0b' : '#10b981' },
              ]}>
                {newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Good' : 'Strong'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={savingPassword}
            style={[btnS.secondary, {
              backgroundColor: dark ? '#1e293b' : '#eef2ff',
              borderColor: dark ? '#475569' : '#c7d2fe',
            }, savingPassword && { opacity: 0.65 }]}
          >
            {savingPassword
              ? <ActivityIndicator size="small" color="#6366f1" />
              : <>
                  <Ionicons name="lock-closed-outline" size={16} color="#6366f1" />
                  <Text style={[btnS.secondaryText, { color: dark ? '#a5b4fc' : '#6366f1' }]}>Change Password</Text>
                </>
            }
          </TouchableOpacity>
        </SectionCard>

        {/* ── Account stats ── */}
        <SectionCard title="Account Info" icon="ℹ️" thems={theme}>
          <View style={infoS.row}>
            <View style={infoS.item}>
              <Text style={[infoS.value, { color: theme.text }]}>{user?.id ?? '—'}</Text>
              <Text style={[infoS.label, { color: theme.subText }]}>User ID</Text>
            </View>
            <View style={[infoS.divider, { backgroundColor: theme.border }]} />
            <View style={infoS.item}>
              <Text style={[infoS.value, { color: theme.text }]}>{user?.role === 'user' ? 'Citizen' : user?.role}</Text>
              <Text style={[infoS.label, { color: theme.subText }]}>Role</Text>
            </View>
            <View style={[infoS.divider, { backgroundColor: theme.border }]} />
            <View style={infoS.item}>
              <Text style={[infoS.value, { color: theme.text }]}>{memberSince || '—'}</Text>
              <Text style={[infoS.label, { color: theme.subText }]}>Joined</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Danger zone ── */}
        <View style={[dangerS.card, {
          backgroundColor: dark ? '#1e293b' : '#fff',
          borderColor: '#ef4444',
        }]}>
          <View style={dangerS.header}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text style={dangerS.title}>Danger Zone</Text>
          </View>
          <Text style={[dangerS.desc, { color: theme.subText }]}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
          <TouchableOpacity onPress={handleDeleteAccount} style={dangerS.btn}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={dangerS.btnText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const headerS = StyleSheet.create({
  hero:          { paddingHorizontal: 16, paddingBottom: 24 },
  topRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  pageTitle:     { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  logoutBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  userInfo:      { flex: 1, gap: 4 },
  userName:      { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  userEmail:     { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  roleBadge:     { backgroundColor: 'rgba(14,165,233,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(14,165,233,0.4)' },
  roleText:      { color: '#7dd3fc', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  memberSince:   { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '500' },
});

const btnS = StyleSheet.create({
  primary:      { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  primaryGrad:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  primaryText:  { color: '#fff', fontSize: 14, fontWeight: '800' },
  secondary:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#c7d2fe', borderRadius: 14, paddingVertical: 13, backgroundColor: '#eef2ff', marginTop: 4 },
  secondaryText:{ color: '#6366f1', fontSize: 14, fontWeight: '700' },
});

const pwdS = StyleSheet.create({
  strengthWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: -4 },
  barBg:         { flex: 1, height: 4, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill:       { height: '100%', borderRadius: 4 },
  strengthLabel: { fontSize: 11, fontWeight: '700', width: 48, textAlign: 'right' },
});

const infoS = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center' },
  item:    { flex: 1, alignItems: 'center', gap: 4 },
  divider: { width: 1, height: 40, backgroundColor: '#f1f5f9' },
  value:   { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  label:   { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
});

const dangerS = StyleSheet.create({
  card:   { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: '#fee2e2' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title:  { fontSize: 14, fontWeight: '700', color: '#ef4444' },
  desc:   { fontSize: 13, color: '#64748b', lineHeight: 19, marginBottom: 14 },
  btn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 14, paddingVertical: 13, backgroundColor: '#fef2f2' },
  btnText:{ color: '#ef4444', fontSize: 14, fontWeight: '700' },
});