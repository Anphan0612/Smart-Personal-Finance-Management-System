import React from 'react';
import {StyleSheet, View} from 'react-native';
import {DashboardSummary} from '../../services/api/dashboardService';
import {ThemedText} from '../themed-text';
import {ThemedView} from '../themed-view';
import {IconSymbol} from '../ui/icon-symbol';

interface SummaryStatsProps {
  summary: DashboardSummary | null;
  isLoading?: boolean;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ summary, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    isPositive?: boolean;
  }> = ({ title, value, icon, color, isPositive = true }) => (
    <ThemedView style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <IconSymbol name={icon as any} size={20} color={color} />
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={[styles.statValue, { color }]}>
        {isPositive && value > 0 ? '+' : ''}{formatCurrency(value)}
      </ThemedText>
    </ThemedView>
  );

  const LoadingCard = () => (
    <ThemedView style={styles.statCard}>
      <View style={styles.loadingSkeleton}>
        <View style={styles.loadingIcon} />
        <View style={styles.loadingTitle} />
        <View style={styles.loadingValue} />
      </View>
    </ThemedView>
  );

  if (isLoading || !summary) {
    return (
      <View style={styles.container}>
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </View>
    );
  }

  const net = summary.income - summary.expenses;

  return (
    <View style={styles.container}>
      <StatCard
        title="Income"
        value={summary.income}
        icon="arrow.up.circle"
        color="#10b981"
      />
      <StatCard
        title="Expenses"
        value={summary.expenses}
        icon="arrow.down.circle"
        color="#ef4444"
        isPositive={false}
      />
      <StatCard
        title="Net"
        value={net}
        icon={net >= 0 ? "plus.circle" : "minus.circle"}
        color={net >= 0 ? "#10b981" : "#ef4444"}
      />
      <StatCard
        title="Savings Rate"
        value={summary.savingsRate}
        icon="percent"
        color="#3b82f6"
        isPositive={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingSkeleton: {
    alignItems: 'flex-start',
  },
  loadingIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginBottom: 8,
  },
  loadingTitle: {
    width: 60,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingValue: {
    width: 80,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});