import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationDetails() {
  const { notification } = useLocalSearchParams();
  const data = JSON.parse(notification as string);
  const router = useRouter();

  const getTypeMeta = (type?: string) => {
    switch (type) {
      case 'urgent':
        return { color: '#ef4444', icon: 'alert-circle' };
      case 'success':
        return { color: '#10b981', icon: 'checkmark-circle' };
      default:
        return { color: '#3b82f6', icon: 'information-circle' };
    }
  };

  const meta = getTypeMeta(data.type);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Card */}
      <View style={styles.card}>

        {/* Icon + Type */}
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: meta.color + '20' }]}>
            <Ionicons name={meta.icon as any} size={26} color={meta.color} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.subText}>
              {new Date(data.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>Message</Text>
          <Text style={styles.message}>{data.message}</Text>
        </View>

        {/* Extra info */}
        {data.report_id && (
          <View style={styles.infoBox}>
            <Ionicons name="document-text-outline" size={18} color="#64748b" />
            <Text style={styles.infoText}>
              Related Report ID: #{data.report_id}
            </Text>
          </View>
        )}

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: meta.color }]}>
          <Text style={styles.badgeText}>
            {data.type?.toUpperCase() || 'INFO'}
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    marginTop: 24,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,

    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },

  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },

  subText: {
    fontSize: 12,
    color: '#64748b',
  },

  messageBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  messageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  message: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },

  infoText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
