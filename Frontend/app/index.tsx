import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIChatWidget from './ChatbotFAB';

// ── Animated fade-slide wrapper
function FadeIn({
  children,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(direction === 'up' ? 28 : direction === 'left' ? -28 : 28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translate, {
        toValue: 0,
        delay,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const transform =
    direction === 'up'
      ? [{ translateY: translate }]
      : [{ translateX: translate }];

  return (
    <Animated.View style={{ opacity, transform }}>{children}</Animated.View>
  );
}

// ── Stat chip
function StatChip({ value, label, dark }: { value: string; label: string; dark: boolean }) {
  return (
    <View style={[chipStyles.chip, dark ? chipStyles.chipDark : chipStyles.chipLight]}>
      <Text style={[chipStyles.value, { color: dark ? '#fff' : '#0f172a' }]}>{value}</Text>
      <Text style={[chipStyles.label, { color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.5)' }]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  chipDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.15)',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  value: {
    fontSize: 22,
    letterSpacing: -0.5,
    fontFamily: 'InterBlack',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

// ── Feature card
function FeatureCard({
  emoji,
  title,
  desc,
  accent,
  dark,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  dark: boolean;
}) {
  return (
    <View style={[fcStyles.card, dark ? fcStyles.cardDark : fcStyles.cardLight]}>
      <View style={[fcStyles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Text style={fcStyles.emoji}>{emoji}</Text>
      </View>
      <View style={fcStyles.text}>
        <Text style={[fcStyles.title, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{title}</Text>
        <Text style={[fcStyles.desc, { color: dark ? 'rgba(241,245,249,0.55)' : 'rgba(15,23,42,0.55)' }]}>{desc}</Text>
      </View>
      <View style={[fcStyles.arrow, { backgroundColor: accent + '22' }]}>
        <Text style={{ color: accent, fontSize: 14, fontWeight: '700' }}>→</Text>
      </View>
    </View>
  );
}

const fcStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 22,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});

// ── Testimonial card
function TestimonialCard({ quote, name, role, dark }: { quote: string; name: string; role: string; dark: boolean }) {
  return (
    <View style={[tcStyles.card, dark ? tcStyles.dark : tcStyles.light]}>
      <Text style={[tcStyles.quote, { color: dark ? 'rgba(241,245,249,0.8)' : 'rgba(15,23,42,0.75)' }]}>
        {`"`}{quote}{`"`}
      </Text>
      <View style={tcStyles.author}>
        <View style={tcStyles.avatar}>
          <Text style={{ fontSize: 14 }}>{name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={[tcStyles.name, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{name}</Text>
          <Text style={[tcStyles.role, { color: dark ? 'rgba(241,245,249,0.45)' : 'rgba(15,23,42,0.45)' }]}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

const tcStyles = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, width: 260, marginRight: 14 },
  dark:  { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  light: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(14,165,233,0.1)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  quote: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center' },
  name:   { fontSize: 16, fontWeight: '700' },
  role:   { fontSize: 14, marginTop: 1 },
});

// ── Step badge
function StepCard({ num, title, desc, dark }: { num: string; title: string; desc: string; dark: boolean }) {
  return (
    <View style={[stepStyles.card, dark ? stepStyles.dark : stepStyles.light]}>
      <View style={stepStyles.numWrap}>
        <Text style={stepStyles.num}>{num}</Text>
      </View>
      <Text style={[stepStyles.title, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{title}</Text>
      <Text style={[stepStyles.desc, { color: dark ? 'rgba(241,245,249,0.5)' : 'rgba(15,23,42,0.5)' }]}>{desc}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: 18, padding: 18, gap: 12, alignItems: 'flex-start' },
  dark:  { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  light: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(14,165,233,0.1)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  numWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center' },
  num:   { color: '#fff', fontSize: 16, fontWeight: '900' },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: 0.1, fontFamily: 'SatoshiBlack' },
  desc:  { fontSize: 14, lineHeight: 17, fontFamily: 'InterRegular' },
});

// ── Main component
export default function Home() {
  const router      = useRouter();
  const colorScheme = useColorScheme();
  const dark        = colorScheme === 'dark';
  const { width }   = useWindowDimensions();

  const colors = {
    bg: dark ? '#0b1220' : '#f8fafc',
    card: dark ? '#111827' : '#ffffff',
    border: dark ? '#1f2937' : '#e2e8f0',
    text: dark ? '#f1f5f9' : '#0f172a',
    subText: dark ? '#94a3b8' : '#64748b',
    accent: '#0ea5e9',
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const [stats, setStats] = useState({
    reports: 0,
    resolved: 0,
    morocco: 0,
  });

  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
  checkAuth();
  fetchStats();
}, []);

const checkAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    setIsAuthenticated(!!token);
  } catch (e) {
    console.log(e);
  }
};


const [loading, setLoading] = useState(true);

const fetchStats = async () => {
  try {
    const res = await api.get('/wel');
    setStats({
      reports: res.data.latest_report,
      resolved: res.data.resolved_reports,
      morocco: res.data.users,
    });

    setUserReports(res.data.user_reports);
  } catch (e) {
    console.log(e);
  } finally {
    setLoading(false);
  }
};

const TESTIMONIALS = React.useMemo(() => {
  if (!userReports || userReports.length === 0) {
    return [
      {
        quote: 'Be the first to report and improve your city!',
        name: 'You',
        role: 'Future Contributor',
      },
    ];
  }

  return [...userReports]
    .sort((a, b) => b.report_count - a.report_count)
    .slice(0, 5)
    .map((user) => ({
      quote: `I submitted ${user.report_count} reports and helped improve my city.`,
      name: user.name || 'Anonymous',
      role: user.role === 'user' ? 'Citizen' : (user.role || 'Civic Contributor'),
    }));
}, [userReports]);


  const bg   = dark ? '#080c14' : '#f0f7ff';
  const text = dark ? '#f1f5f9' : '#0f172a';

  const FEATURES = [
    { emoji: '📸', title: 'Report Issues Instantly',   desc: 'Snap a photo, speak, or type — AI classifies and routes it automatically.',   accent: '#0ea5e9' },
    { emoji: '🤖', title: 'AI-Powered Analysis',       desc: 'Our AI detects severity, category and generates a structured city report.',    accent: '#8b5cf6' },
    { emoji: '🗺️', title: 'Live City Map',             desc: 'See all open reports plotted on an interactive heatmap of your city.',         accent: '#10b981' },
    { emoji: '🔔', title: 'Real-Time Notifications',   desc: 'Get alerted when your report status changes or AI analysis completes.',        accent: '#f59e0b' },
    { emoji: '📊', title: 'Analytics Dashboard',       desc: 'Track resolution rates, category trends and your neighbourhood stats.',        accent: '#ef4444' },
    { emoji: '🏛️', title: 'Direct to Authorities',    desc: 'Reports are routed to the right department automatically — no bureaucracy.',   accent: '#0ea5e9' },
  ];

  const currentYear = new Date().getFullYear();



  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >

        {/* ── HERO ── */}
        <LinearGradient
          colors={dark
            ? ['#080c14', '#2369A4']
            : ['#dbeafe', '#f0f7ff']}
          style={heroS.gradient}
        >
          {/* Badge */}
          <FadeIn delay={100}>
            <View style={[heroS.badge, { backgroundColor: dark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.12)' }]}>
              <View style={heroS.badgeDot} />
              <Text style={heroS.badgeText}>AI-powered civic platform</Text>
            </View>
          </FadeIn>

          {/* Logo */}
          <FadeIn delay={200}>
            <View style={[heroS.logoWrap, { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(14,165,233,0.2)' }]}>
              <Image
                source={require('@/assets/logo/CivicLens-icon.png')}
                style={{ width: 64, height: 52 }}
              />
            </View>
          </FadeIn>

          {/* Title */}
          <FadeIn delay={300}>
            <Text style={[heroS.title, { color: text }]}>
              Civic
              <Text style={{ color: '#0ea5e9' }}>Lens</Text>
            </Text>
          </FadeIn>

          <FadeIn delay={400}>
            <Text style={[heroS.sub, { color: dark ? 'rgba(241,245,249,0.6)' : 'rgba(15,23,42,0.55)' }]}>
              Report city issues. Track progress.{'\n'}Make your neighbourhood better.
            </Text>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={500}>
            <View style={heroS.ctas}>
              <TouchableOpacity
                onPress={() => {
                  if (isAuthenticated) {
                    router.push('/dashboard');
                  } else {
                    router.push('/register');
                  }
                }}
                activeOpacity={0.85}
                style={heroS.btnPrimary}
              >
                <LinearGradient
                  colors={['#38bdf8', '#0284c7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={heroS.btnGrad}
                >
                  <Text style={heroS.btnPrimaryText}>Get Started — Free</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                if (isAuthenticated) {
                  router.push('/dashboard');
                } else {
                  router.push('/login');
                }
              }}
                activeOpacity={0.85}
                style={[heroS.btnSecondary, { borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(14,165,233,0.3)', backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)' }]}
              >
                <Text style={[heroS.btnSecondaryText, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{
                   isAuthenticated ? 'Welcome back' : 'Sign In'
                  }</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>

          {/* Stats row */}
          <FadeIn delay={600}>
            {loading ? (
              <Text>Loading...</Text>
            ) : (
              <View style={heroS.stats}>
                <StatChip value={String(stats.reports)} label="Reports" dark={dark} />
                <StatChip value={String(stats.resolved)} label="Resolved" dark={dark} />
                <StatChip value={String(stats.morocco)} label="Users" dark={dark} />
              </View>
            )}
          </FadeIn>
        </LinearGradient>

        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          {/* Header */}
          <Text style={[styles.brand, { color: colors.text }]}>CivicLens</Text>

          <Text style={[styles.subtitle, { color: colors.subText }]}>
            CivicLens makes it simple, and delivers results.
          </Text>

          {/* Card 1 */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.percent, { color: colors.accent }]}>30%</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              The "Smart Triage" Impact
            </Text>
            <Text style={[styles.desc, { color: colors.subText }]}>
              AI automates reporting and GPS routing, eliminating errors and redundant crew trips to
              save 30% of the city's operational budget.
            </Text>
          </View>

          {/* Card 2 */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.percent, { color: colors.accent }]}>15%</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              The "Resource Protection" Impact
            </Text>
            <Text style={[styles.desc, { color: colors.subText }]}>
              Real-time citizen reporting of leaks and illegal waste helps recover 15% of GDP losses
              caused by environmental degradation.
            </Text>
          </View>

          {/* Card 3 */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.percent, { color: colors.accent }]}>50%</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              The "Civic Trust" Impact
            </Text>
            <Text style={[styles.desc, { color: colors.subText }]}>
              Digital pipelines replace manual workflows, reducing resolution time for urban issues by 50%.
            </Text>
          </View>
        </View>
 
        {/* ── HOW IT WORKS ── */}
        <View style={[sectionS.section, { paddingHorizontal: 20 }]}>
          <FadeIn delay={100}>
            <View style={sectionS.label}>
              <Text style={sectionS.labelText}>HOW IT WORKS</Text>
            </View>
            <Text style={[sectionS.heading, { color: text }]}>
              3 steps to fix your city
            </Text>
          </FadeIn>
          <FadeIn delay={200}>
            <View style={{ flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <StepCard num="1" title="Snap it"    desc="Take a photo or record voice of the issue."   dark={dark} />
              <StepCard num="2" title="AI does it" desc="Our AI analyses, categorises and routes it."  dark={dark} />
              <StepCard num="3" title="Track it"   desc="Get notified as authorities resolve the issue." dark={dark} />
            </View>
          </FadeIn>
        </View>

        {/* ── FEATURES ── */}
        <View style={[sectionS.section, { paddingHorizontal: 20 }]}>
          <FadeIn delay={100}>
            <View style={sectionS.label}>
              <Text style={sectionS.labelText}>FEATURES</Text>
            </View>
            <Text style={[sectionS.heading, { color: text }]}>
              Everything you need
            </Text>
          </FadeIn>
          <View style={{ gap: 12, marginTop: 16 }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={i} delay={150 + i * 60}>
                <FeatureCard {...f} dark={dark} />
              </FadeIn>
            ))}
          </View>
        </View>

        {/* ── AI HIGHLIGHT ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <FadeIn delay={100}>
            <LinearGradient
              colors={['#0284c7', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={aiS.card}
            >
              <Text style={aiS.tag}>🤖 AI ENGINE</Text>
              <Text style={aiS.title}>Powered by Huggingface</Text>
              <Text style={aiS.desc}>
                Our AI stack uses state-of-the-art vision and language models to
                automatically caption images, transcribe voice, classify issue
                severity, and generate actionable summaries for city authorities.
              </Text>
              <View style={aiS.pills}>
                {['BLIP Vision', 'VibeVoice ASR', 'BART Zero-shot', 'Llama 3.1', 'Meta Llama'].map(p => (
                  <View key={p} style={aiS.pill}>
                    <Text style={aiS.pillText}>{p}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </FadeIn>
        </View>

        {/* ── TESTIMONIALS ── */}
        <View style={[sectionS.section, { paddingHorizontal: 0 }]}>
          <FadeIn delay={100}>
            <View style={{ paddingHorizontal: 20 }}>
              <View style={sectionS.label}>
                <Text style={sectionS.labelText}>CITIZENS SPEAK</Text>
              </View>
              <Text style={[sectionS.heading, { color: text }]}>
                Trusted by hundreds
              </Text>
            </View>
          </FadeIn>
          <FadeIn delay={200}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
            >
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} {...t} dark={dark} />
              ))}
            </ScrollView>
          </FadeIn>
        </View>

        {/* ── BOTTOM CTA ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <FadeIn delay={100}>
            <View style={[ctaS.card, { backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(14,165,233,0.15)' }]}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🏙️</Text>
              <Text style={[ctaS.title, { color: text }]}>
                Your city needs you
              </Text>
              <Text style={[ctaS.sub, { color: dark ? 'rgba(241,245,249,0.5)' : 'rgba(15,23,42,0.5)' }]}>
                Join thousands of citizens already making their neighbourhoods better.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/register')}
                activeOpacity={0.85}
                style={{ width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 20 }}
              >
                <LinearGradient
                  colors={['#38bdf8', '#0284c7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={ctaS.btn}
                >
                  <Text style={ctaS.btnText}>Create Free Account →</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 14 }}>
                <Text style={{ color: '#0ea5e9', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                  Already have an account? Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </FadeIn>
        </View>

        {/* ── FOOTER ── */}
        <View style={footerS.footer}>
          <Text style={[footerS.text, { color: dark ? 'rgba(241,245,249,0.3)' : 'rgba(15,23,42,0.35)' }]}>
            CivicLens © {currentYear} · Built for better cities
          </Text>
          <Text style={[footerS.links, { color: dark ? 'rgba(241,245,249,0.3)' : 'rgba(15,23,42,0.35)' }]}>
            Terms · Privacy · Contact
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Style blocks

const heroS = StyleSheet.create({
  gradient: {
    paddingHorizontal: 24,
    paddingTop: 142,
    paddingBottom: 120,
    alignItems: 'center',
    gap: 38,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.25)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0ea5e9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0ea5e9',
    letterSpacing: 0.4,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    lineHeight: 60,
    marginTop: 4,
    fontFamily: 'SatoshiBold',
  },
  sub: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.1,
    fontFamily: 'InterRegular',
  },
  ctas: {
    width: '100%',
    gap: 12,
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
  },
  btnPrimary: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  btnGrad: {
    paddingVertical: 18,
    alignItems: 'center',
    paddingHorizontal:20,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'InterSemiBold',
  },
  btnSecondary: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 17,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 16,
    paddingHorizontal:20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
});


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 14,
  },

  brand: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    fontFamily: 'SatoshiBlack',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
    fontFamily: 'InterRegular',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  percent: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0ea5e9',
    marginBottom: 6,
    fontFamily: 'InterBlack',
  },

  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },

  desc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
});

const sectionS = StyleSheet.create({
  section: {
    marginVertical: 40,
    paddingTop: 8,
  },
  label: {
    marginBottom: 6,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0ea5e9',
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 26,    
    letterSpacing: -0.5,
    lineHeight: 32,
    fontFamily: 'InterBold',
  },
});

const aiS = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    gap: 10,
  },
  tag: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

const ctaS = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: 'SatoshiBlack',
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    fontFamily: 'InterRegular',
  },
  btn: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'InterSemiBold',
  },
});

const footerS = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  links: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});