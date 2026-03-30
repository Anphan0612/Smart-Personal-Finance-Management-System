import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLegend} from 'victory-native';
import {CHART_CONFIG} from '../../constants/dashboard';
import {MonthlyTrend} from '../../services/api/dashboardService';
import {ThemedText} from '../themed-text';
import {ThemedView} from '../themed-view';

const { width } = Dimensions.get('window');

interface MonthlySeriesProps {
  data: MonthlyTrend[] | null;
  isLoading?: boolean;
}

export const MonthlySeries: React.FC<MonthlySeriesProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Monthly Trend</ThemedText>
        <View style={styles.loadingChart} />
      </ThemedView>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M`;
  };

  const chartData = data.map(item => ({
    month: item.month,
    income: item.income / 1000000, // Convert to millions for better display
    expenses: item.expenses / 1000000,
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Monthly Trend</ThemedText>
      <View style={styles.chartContainer}>
        <VictoryChart
          height={CHART_CONFIG.barChart.height}
          padding={CHART_CONFIG.barChart.padding}
          domainPadding={{ x: 20 }}
        >
          <VictoryLegend
            x={width * 0.3}
            y={10}
            orientation="horizontal"
            gutter={20}
            data={[
              { name: 'Income', symbol: { fill: '#10b981' } },
              { name: 'Expenses', symbol: { fill: '#ef4444' } },
            ]}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#d1d5db' },
              tickLabels: { fill: '#6b7280', fontSize: 12 },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#d1d5db' },
              tickLabels: { fill: '#6b7280', fontSize: 12 },
            }}
            tickFormat={formatCurrency}
          />
          <VictoryGroup offset={15}>
            <VictoryBar
              data={chartData}
              x="month"
              y="income"
              style={{
                data: { fill: '#10b981', width: 12 },
              }}
              barRatio={CHART_CONFIG.barChart.barRatio}
            />
            <VictoryBar
              data={chartData}
              x="month"
              y="expenses"
              style={{
                data: { fill: '#ef4444', width: 12 },
              }}
              barRatio={CHART_CONFIG.barChart.barRatio}
            />
          </VictoryGroup>
        </VictoryChart>
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
  },
  loadingChart: {
    width: '100%',
    height: CHART_CONFIG.barChart.height,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
});