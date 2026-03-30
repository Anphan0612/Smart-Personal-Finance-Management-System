import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { DashboardSummary } from '../../services/api/dashboardService';

interface SummaryCardProps {
  summary?: DashboardSummary | null;
  isLoading: boolean;
}

export const SummaryCard = ({ summary, isLoading }: SummaryCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.balanceLabel}>Tổng số dư</Text>
      <Text style={styles.balance}>
        {isLoading ? 'Loading...' : `${summary?.balance?.toLocaleString('vi-VN')} VND`}
      </Text>

      <View style={styles.cardRow}>
        <Text style={styles.cardNumber}>0110 ••• 8207</Text>
        <Ionicons name="card-outline" size={20} color={theme.colors.onSurface} />
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.cardName}>Nguyễn Ngọc Quỳnh Anh</Text>
        <Text style={styles.exp}>09/29</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.roundness.md,
    padding: 20,
    marginTop: 20,
    ...theme.shadows.ambient,
  },
  balanceLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    fontFamily: theme.typography.body.fontFamily,
  },
  balance: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: theme.typography.display.fontFamily,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  cardNumber: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: theme.typography.display.fontFamily,
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  cardName: {
    color: theme.colors.onSurface,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.typography.body.fontFamily,
    textTransform: 'uppercase',
  },
  exp: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
});