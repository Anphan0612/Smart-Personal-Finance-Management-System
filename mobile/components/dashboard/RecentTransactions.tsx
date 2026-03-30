import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Transaction } from '../../services/api/dashboardService';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { IconSymbol } from '../ui/icon-symbol';

interface RecentTransactionsProps {
  transactions: Transaction[] | null;
  isLoading?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => (
    <ThemedView style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: item.type === 'income' ? '#dcfce7' : '#fef2f2' }]}>
          <IconSymbol
            name={item.type === 'income' ? 'arrow.up.circle' : 'arrow.down.circle'}
            size={16}
            color={item.type === 'income' ? '#10b981' : '#ef4444'}
          />
        </View>
        <View style={styles.transactionDetails}>
          <ThemedText style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </ThemedText>
          <ThemedText style={styles.transactionCategory}>
            {item.category} • {formatDate(item.date)}
          </ThemedText>
        </View>
      </View>
      <ThemedText
        style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#10b981' : '#ef4444' }
        ]}
      >
        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
      </ThemedText>
    </ThemedView>
  );

  const LoadingItem = () => (
    <ThemedView style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.loadingIcon} />
        <View style={styles.loadingDetails}>
          <View style={styles.loadingDescription} />
          <View style={styles.loadingCategory} />
        </View>
      </View>
      <View style={styles.loadingAmount} />
    </ThemedView>
  );

  const renderLoadingItems = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <LoadingItem key={`loading-${index}`} />
    ));
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Recent Transactions</ThemedText>
        <View style={styles.loadingList}>
          {renderLoadingItems()}
        </View>
      </ThemedView>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Recent Transactions</ThemedText>
        <View style={styles.emptyContainer}>
          <IconSymbol name="list.bullet" size={48} color="#d1d5db" />
          <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Recent Transactions</ThemedText>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={5}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingList: {
    gap: 12,
  },
  loadingIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginRight: 12,
  },
  loadingDetails: {
    flex: 1,
  },
  loadingDescription: {
    width: '70%',
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
  },
  loadingCategory: {
    width: '50%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  loadingAmount: {
    width: 80,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});