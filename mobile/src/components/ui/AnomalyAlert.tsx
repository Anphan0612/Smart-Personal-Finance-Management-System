import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { AlertTriangle, ChevronRight, TrendingUp } from "lucide-react-native";
import { formatCurrency } from "../../utils/format";

interface AnomalyAlertProps {
  anomalies: Array<{
    transaction_id: string;
    amount: number;
    category: string;
    z_score: number;
    mean: number;
    severity: string;
    message: string;
    description?: string;
    transaction_date?: string;
  }>;
  onPress?: () => void;
}

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  CRITICAL: { bg: "#FDE8E8", border: "#D32F2F", icon: "#D32F2F", label: "Nghiêm trọng" },
  HIGH: { bg: "#FFF3E0", border: "#E65100", icon: "#E65100", label: "Cao" },
  MEDIUM: { bg: "#FFF8E1", border: "#F9A825", icon: "#F9A825", label: "Trung bình" },
  LOW: { bg: "#E8F5E9", border: "#2E7D32", icon: "#2E7D32", label: "Thấp" },
};

export const AnomalyAlert = ({ anomalies, onPress }: AnomalyAlertProps) => {
  if (!anomalies || anomalies.length === 0) return null;

  const topAnomaly = anomalies[0];
  const config = SEVERITY_CONFIG[topAnomaly.severity] || SEVERITY_CONFIG.MEDIUM;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 150, delay: 600 }}
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
        {/* Header Row */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: config.border + "20" }]}>
            <AlertTriangle size={18} color={config.border} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: config.border }]}>
              Chi tiêu bất thường
            </Text>
            <Text style={styles.subtitle}>
              {anomalies.length} cảnh báo • Mức {config.label}
            </Text>
          </View>
          <ChevronRight size={18} color={config.border} />
        </View>

        {/* Main anomaly detail */}
        <View style={styles.detail}>
          <Text style={styles.message} numberOfLines={2}>
            {topAnomaly.message}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Số tiền</Text>
            <Text style={[styles.statValue, { color: "#D32F2F" }]}>
              {formatCurrency(topAnomaly.amount)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Trung bình</Text>
            <Text style={[styles.statValue, { color: "#414753" }]}>
              {formatCurrency(topAnomaly.mean)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Bất thường</Text>
            <Text style={[styles.statValue, { color: config.border }]}>
              {topAnomaly.z_score}x
            </Text>
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
    borderWidth: 1.5,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: "#717785",
    fontWeight: "500",
    marginTop: 2,
  },
  detail: {
    marginBottom: 12,
  },
  message: {
    fontSize: 13,
    color: "#414753",
    lineHeight: 19,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    padding: 12,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#717785",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});
