import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '../../hooks/useDashboard';
import { TimeRange } from '../../services/api/dashboardService';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MonthlySeries } from './MonthlySeries';
import { RecentTransactions } from './RecentTransactions';
import { SummaryCard } from './SummaryCard';
import { SummaryStats } from './SummaryStats';
import { TimeFilterButtons } from './TimeFilterButtons';

export const DashboardScreen: React.FC = () => {
  const {
    summary,
    monthlyTrend,
    categoryBreakdown,
    transactions,
    loading,
    error,
    timeRange,
    setTimeRange,
    refetch,
  } = useDashboard();

  const balance = useMemo(() => {
    return summary?.balance ?? 0;
  }, [summary?.balance]);

  const handleRefresh = () => {
    refetch();
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Summary Card */}
        <SummaryCard balance={balance} isLoading={loading} />

        {/* Time Filter */}
        <TimeFilterButtons
          selectedRange={timeRange}
          onRangeChange={handleTimeRangeChange}
          disabled={loading}
        />

        {/* Summary Stats */}
        <SummaryStats summary={summary} isLoading={loading} />

        {/* Charts */}
        <MonthlySeries data={monthlyTrend} isLoading={loading} />
        <CategoryBreakdown data={categoryBreakdown} isLoading={loading} />

        {/* Recent Transactions */}
        <RecentTransactions transactions={transactions} isLoading={loading} />

        {/* Error State */}
        {error && (
          <ThemedView style={styles.errorContainer}>
            <View style={styles.errorContent}>
              <ThemedText style={styles.errorText}>
                Failed to load dashboard data. Pull to refresh.
              </ThemedText>
            </View>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
});