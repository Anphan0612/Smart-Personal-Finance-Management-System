import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { IconSymbol } from '../ui/icon-symbol';

interface SummaryCardProps {
  balance: number;
  isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ balance, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingSkeleton}>
          <View style={styles.loadingBalance} />
          <View style={styles.loadingLabel} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.balanceContainer}>
        <IconSymbol name="wallet.pass" size={24} color="#10b981" />
        <ThemedText style={styles.balanceText}>
          {formatCurrency(balance)}
        </ThemedText>
      </View>
      <ThemedText style={styles.labelText}>Current Balance</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  labelText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  loadingSkeleton: {
    alignItems: 'center',
  },
  loadingBalance: {
    width: 200,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingLabel: {
    width: 120,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});