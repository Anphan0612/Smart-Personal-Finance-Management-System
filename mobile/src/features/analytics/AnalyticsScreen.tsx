import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from "react-native";
import { MotiView } from "moti";
import { 
  TrendingDown, 
  Sparkles
} from "lucide-react-native";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { useAppStore } from "../../store/useAppStore";
import { useDashboard } from "../../hooks/useDashboard";
import { Skeleton } from "../../components/common/Skeleton";
import { MonthlyTrend, CategoryBreakdown } from "../../types/api";
import { formatCurrency } from "../../utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { activeWalletId } = useAppStore();
  const { data: dashboard, isLoading, refetch } = useDashboard(activeWalletId || "");

  // Transform Trends for Line Chart (Expenses)
  const lineData = useMemo(() => {
    if (!dashboard?.monthlyTrend) return [];
    return dashboard.monthlyTrend.map((t: MonthlyTrend) => ({
      value: Number(t.expenses),
      label: t.month.substring(0, 3)
    }));
  }, [dashboard]);

  // Transform Trends for Bar Chart (Income vs Expense)
  const barData = useMemo(() => {
    if (!dashboard?.monthlyTrend) return [];
    const data: any[] = [];
    dashboard.monthlyTrend.forEach((t: MonthlyTrend) => {
      data.push({ 
        value: Number(t.income), 
        label: t.month.substring(0, 3), 
        spacing: 2, 
        frontColor: '#005ab4' 
      });
      data.push({ 
        value: Number(t.expenses), 
        frontColor: '#bd5700' 
      });
    });
    return data;
  }, [dashboard]);

  // Transform Category Breakdown for Pie Chart
  const pieData = useMemo(() => {
    if (!dashboard?.categoryBreakdown) return [];
    const total = dashboard.categoryBreakdown.reduce((sum: number, c: CategoryBreakdown) => sum + Number(c.amount), 0) || 1;
    return dashboard.categoryBreakdown.map((c: CategoryBreakdown) => ({
      value: Number(c.amount),
      color: c.color || '#005ab4',
      text: `${((Number(c.amount) / total) * 100).toFixed(0)}%`,
      name: c.category
    }));
  }, [dashboard]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface p-6 pt-20">
        <Skeleton width={150} height={20} radius={4} style={{ marginBottom: 10 }} />
        <Skeleton width={200} height={40} radius={8} style={{ marginBottom: 40 }} />
        <Skeleton width="100%" height={300} radius={32} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={200} radius={32} />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#005ab4" />
      }
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-8"
      >
        <Text className="font-headline text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">
          Financial Performance
        </Text>
        <Text className="font-headline font-extrabold text-3xl text-on-surface mb-6">Analytics</Text>
      </MotiView>

      {/* Spending Trends Chart */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 800 }}
        className="bg-white rounded-[24px] p-6 mb-6 shadow-sm border border-outline/5"
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="font-headline font-bold text-lg text-on-surface">Spending Trends</Text>
            <Text className="text-xs text-on-surface-variant">Monthly cash flow</Text>
          </View>
          <View className="items-end">
            <Text className="font-headline font-extrabold text-xl text-primary">
              {formatCurrency(dashboard?.summary?.expenses)}
            </Text>
            <View className="flex-row items-center">
              <TrendingDown size={14} color="#465f89" />
              <Text className="text-secondary font-bold text-[10px] ml-1">
                {dashboard?.summary?.savingsRate?.toFixed(1)}% savings rate
              </Text>
            </View>
          </View>
        </View>
        
        <View className="items-center">
          {lineData.length > 0 ? (
            <LineChart
              data={lineData}
              width={SCREEN_WIDTH - 100}
              height={160}
              spacing={45}
              initialSpacing={10}
              color="#005ab4"
              thickness={3}
              startFillColor="rgba(0, 90, 180, 0.3)"
              endFillColor="rgba(0, 90, 180, 0.01)"
              startOpacity={0.4}
              endOpacity={0.1}
              noOfSections={3}
              yAxisThickness={0}
              xAxisThickness={0}
              hideDataPoints
              curved
            />
          ) : (
            <View className="h-40 items-center justify-center">
              <Text className="text-outline text-xs italic">No trend data available</Text>
            </View>
          )}
        </View>
      </MotiView>

      {/* Category Breakdown (Donut) */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", delay: 500 }}
        className="bg-white rounded-[24px] p-6 mb-6 shadow-sm border border-outline/5"
      >
        <Text className="font-headline font-bold text-lg text-on-surface mb-6">Category Breakdown</Text>
        <View className="items-center justify-center h-48 relative">
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              donut
              sectionAutoFocus
              radius={80}
              innerRadius={60}
              innerCircleColor={'white'}
              centerLabelComponent={() => (
                <View className="items-center justify-center">
                  <Text className="font-headline font-extrabold text-xl text-on-surface">Flow</Text>
                  <Text className="text-[8px] text-outline uppercase font-bold tracking-widest">Share</Text>
                </View>
              )}
            />
          ) : (
             <View className="items-center justify-center">
               <Text className="text-outline text-xs italic">No category data</Text>
             </View>
          )}
        </View>
        <View className="mt-6 space-y-3">
          {pieData.map((item: any, i: number) => (
            <View key={i} className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <Text className="text-sm font-medium text-on-surface">{item.name}</Text>
              </View>
              <Text className="text-sm font-bold text-on-surface">{item.text}</Text>
            </View>
          ))}
        </View>
      </MotiView>

      {/* Income vs Expense (Bar) */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", delay: 700 }}
        className="bg-white rounded-[24px] p-6 mb-8 shadow-sm border border-outline/5"
      >
        <View className="flex-row justify-between items-center mb-8">
          <Text className="font-headline font-bold text-lg text-on-surface">Cash Flow</Text>
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-primary" />
              <Text className="text-[8px] font-bold text-outline uppercase">Income</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#bd5700]" />
              <Text className="text-[8px] font-bold text-outline uppercase">Expense</Text>
            </View>
          </View>
        </View>
        <View className="items-center">
          {barData.length > 0 ? (
            <BarChart
              data={barData}
              barWidth={18}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="#005ab4"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              height={150}
              width={SCREEN_WIDTH - 100}
              spacing={25}
            />
          ) : (
            <View className="h-40 items-center justify-center">
              <Text className="text-outline text-xs italic">No flow data available</Text>
            </View>
          )}
        </View>
      </MotiView>
    </ScrollView>
  );
}
