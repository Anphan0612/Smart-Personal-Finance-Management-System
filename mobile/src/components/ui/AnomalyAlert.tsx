import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { formatCurrency } from '../../utils/format';

interface AnomalyAlertProps {
  anomalies: {
    transaction_id: string;
    amount: number;
    category: string;
    severity: string;
    message: string;
    mean: number;
    z_score: number;
  }[];
  onPress?: () => void;
}

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; icon: string; label: string }> =
  {
    CRITICAL: { bg: '#FDE8E8', border: '#ef4444', icon: '#ef4444', label: 'Nghiêm trọng' },
    HIGH: { bg: '#FFF3E0', border: '#f59e0b', icon: '#f59e0b', label: 'Cao' },
    MEDIUM: { bg: '#FFF8E1', border: '#d97706', icon: '#d97706', label: 'Trung bình' },
  };

export const AnomalyAlert = ({ anomalies, onPress }: AnomalyAlertProps) => {
  if (!anomalies || anomalies.length === 0) return null;

  const topAnomaly = anomalies[0];
  const config = SEVERITY_CONFIG[topAnomaly.severity] || SEVERITY_CONFIG.MEDIUM;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 18, delay: 600 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: config.bg,
            borderColor: config.border,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: config.border + '20' }]}>
            <AlertTriangle size={18} color={config.border} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: config.border }]}>Chi tiêu bất thường</Text>
            <Text style={styles.subtitle}>
              {anomalies.length} cảnh báo • {config.label}
            </Text>
          </View>
          <ChevronRight size={18} color={config.border} />
        </View>

        <View style={styles.detail}>
          <Text style={styles.message} numberOfLines={2}>
            {topAnomaly.message}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Số tiền</Text>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>
              {formatCurrency(topAnomaly.amount)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Trung bình</Text>
            <Text style={styles.statValue}>{formatCurrency(topAnomaly.mean)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    color: '#74777f',
    marginTop: 2,
  },
  detail: {
    marginBottom: 12,
  },
  message: {
    fontSize: 13,
    color: '#32343a',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#74777f',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
