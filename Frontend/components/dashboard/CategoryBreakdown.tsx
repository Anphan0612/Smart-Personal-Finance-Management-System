import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VictoryLabel, VictoryPie } from 'victory-native';
import { CHART_CONFIG } from '../../constants/dashboard';
import { CategoryBreakdown as CategoryBreakdownType } from '../../services/api/dashboardService';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface CategoryBreakdownProps {
  data: CategoryBreakdownType[] | null;
  isLoading?: boolean;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data, isLoading }) => {
  if (isLoading || !data || data.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Category Breakdown</ThemedText>
        <View style={styles.loadingChart} />
      </ThemedView>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const chartData = data.map(item => ({
    x: item.category,
    y: item.amount,
    label: `${((item.amount / total) * 100).toFixed(1)}%`,
    color: item.color,
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Category Breakdown</ThemedText>
      <View style={styles.chartContainer}>
        <VictoryPie
          data={chartData}
          height={CHART_CONFIG.pieChart.height}
          innerRadius={CHART_CONFIG.pieChart.innerRadius}
          padAngle={CHART_CONFIG.pieChart.padAngle}
          style={{
            data: {
              fill: (datum: any) => datum.color,
            },
            labels: {
              fill: '#374151',
              fontSize: 12,
              fontWeight: 'bold',
            },
          }}
          labelComponent={<VictoryLabel />}
        />
      </View>
      <View style={styles.legendContainer}>
        {data.map((item) => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <ThemedText style={styles.legendText}>
              {item.category}: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
              }).format(item.amount)}
            </ThemedText>
          </View>
        ))}
      </View>
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingChart: {
    width: '100%',
    height: CHART_CONFIG.pieChart.height,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
});