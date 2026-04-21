import React, { useMemo } from "react";
import { View, ScrollView, Dimensions, RefreshControl } from "react-native";
import { MotiView } from "moti";
import { 
  TrendingDown, 
  Sparkles,
  ChevronRight
} from "lucide-react-native";
import { LineChart, PieChart, BarChart } from "react-native-gifted-charts";
import { useAppStore } from "../../store/useAppStore";
import { useDashboard } from "../../hooks/useDashboard";
import { MonthlyTrend, CategoryBreakdown } from "../../types/api";
import { formatCurrency } from "../../utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  AtelierTypography, 
  AtelierCard, 
  SkeletonBox 
} from "@/components/ui";
import { Colors } from "@/constants/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { activeWalletId } = useAppStore();
  const { data: dashboard, isLoading, refetch, isRefetching } = useDashboard(activeWalletId || "");

  // Transform Trends for Line Chart (Expenses)
  const lineData = useMemo(() => {
    if (!dashboard?.monthlyTrend) return [];
    return dashboard.monthlyTrend.map((t: MonthlyTrend) => ({
      value: Number(t.expenses),
      label: t.month.substring(0, 3)
    }));
  }, [dashboard]);

  // Transform Category Breakdown for Pie Chart
  const pieData = useMemo(() => {
    if (!dashboard?.categoryBreakdown) return [];
    const total = dashboard.categoryBreakdown.reduce((sum: number, c: CategoryBreakdown) => sum + Number(c.amount), 0) || 1;
    
    // Modern palette for pie chart
    const chartColors = [
      Colors.primary.DEFAULT,
      Colors.secondary.DEFAULT,
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#f97316', // Orange
    ];

    return dashboard.categoryBreakdown.map((c: CategoryBreakdown, index: number) => ({
      value: Number(c.amount),
      color: chartColors[index % chartColors.length],
      text: `${((Number(c.amount) / total) * 100).toFixed(0)}%`,
      name: c.category
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
        spacing: 4, 
        frontColor: Colors.primary.DEFAULT
      });
      data.push({
        value: Number(t.expenses),
        frontColor: Colors.secondary.DEFAULT 
      });
    });
    return data;
  }, [dashboard]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-lowest p-6" style={{ paddingTop: insets.top + 72 }}>
        <SkeletonBox width={150} height={16} radius={4} className="mb-2" />
        <SkeletonBox width={200} height={40} radius={8} className="mb-10" />
        <SkeletonBox width="100%" height={300} radius={32} className="mb-6" />
        <SkeletonBox width="100%" height={240} radius={32} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-lowest">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 88, paddingHorizontal: 24, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            tintColor={Colors.primary.DEFAULT}
            colors={[Colors.primary.DEFAULT]}
          />
        }
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8"
        >
          <AtelierTypography variant="label" className="text-neutral-400 mb-1">
            HIỆU SUẤT TÀI CHÍNH
          </AtelierTypography>
          <AtelierTypography variant="h1" className="text-neutral-900">
            Phân tích.
          </AtelierTypography>
        </MotiView>

        {/* Spending Trends Chart */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 800 }}
        >
          <AtelierCard padding="md" className="mb-6 bg-white border border-neutral-100">
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <AtelierTypography variant="h3">Xu hướng chi tiêu</AtelierTypography>
                <AtelierTypography variant="caption" className="text-neutral-400">Dòng tiền hàng tháng</AtelierTypography>
              </View>
              <View className="items-end">
                <AtelierTypography variant="h2" className="text-primary">
                  {formatCurrency(dashboard?.summary?.expenses)}
                </AtelierTypography>
                <View className="flex-row items-center bg-secondary/10 px-2 py-0.5 rounded-full mt-1">
                  <TrendingDown size={12} color={Colors.secondary.DEFAULT} />
                  <AtelierTypography variant="label" className="text-secondary text-[10px] ml-1">
                    {dashboard?.summary?.savingsRate?.toFixed(1)}% tiết kiệm
                  </AtelierTypography>
                </View>
              </View>
            </View>
            
            <View className="items-center">
              {lineData.length > 0 ? (
                <LineChart
                  data={lineData}
                  width={SCREEN_WIDTH - 100}
                  height={180}
                  spacing={45}
                  initialSpacing={10}
                  color={Colors.primary.DEFAULT}
                  thickness={3}
                  startFillColor={Colors.primary.DEFAULT}
                  endFillColor={Colors.primary.DEFAULT}
                  startOpacity={0.15}
                  endOpacity={0.01}
                  noOfSections={3}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideDataPoints
                  curved
                  xAxisLabelTextStyle={{ fontSize: 10, color: Colors.neutral[400], fontFamily: 'Inter_600SemiBold' }}
                  yAxisTextStyle={{ fontSize: 10, color: Colors.neutral[400] }}
                />
              ) : (
                <View className="h-40 items-center justify-center">
                  <AtelierTypography variant="body" className="text-neutral-300 italic">Chưa có dữ liệu xu hướng</AtelierTypography>
                </View>
              )}
            </View>
          </AtelierCard>
        </MotiView>

        {/* Category Breakdown */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 200 }}
        >
          <AtelierCard padding="md" className="mb-6 bg-white border border-neutral-100">
            <AtelierTypography variant="h3" className="mb-8">Phân bổ danh mục</AtelierTypography>
            <View className="flex-row items-center justify-between">
              <View className="items-center justify-center relative">
                {pieData.length > 0 ? (
                  <PieChart
                    data={pieData}
                    donut
                    sectionAutoFocus
                    radius={75}
                    innerRadius={55}
                    innerCircleColor={'white'}
                    centerLabelComponent={() => (
                      <View className="items-center justify-center">
                        <Sparkles size={20} color={Colors.primary.DEFAULT} opacity={0.5} />
                        <AtelierTypography variant="label" className="text-neutral-400 text-[10px] mt-1">TOTAL</AtelierTypography>
                      </View>
                    )}
                  />
                ) : (
                   <View className="items-center justify-center h-36">
                     <AtelierTypography variant="body" className="text-neutral-300 italic">Chưa có dữ liệu danh mục</AtelierTypography>
                   </View>
                )}
              </View>
              <View className="flex-1 ml-6 gap-3">
                {pieData.slice(0, 5).map((item: any, i: number) => (
                  <View key={i} className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <AtelierTypography variant="body" className="text-xs text-neutral-600" numberOfLines={1}>{item.name}</AtelierTypography>
                    </View>
                    <AtelierTypography variant="h3" className="text-xs">{item.text}</AtelierTypography>
                  </View>
                ))}
              </View>
            </View>
          </AtelierCard>
        </MotiView>

        {/* Cash Flow Bar Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 400 }}
        >
          <AtelierCard padding="md" className="mb-10 bg-white border border-neutral-100">
            <View className="flex-row justify-between items-center mb-8">
              <AtelierTypography variant="h3">Dòng tiền</AtelierTypography>
              <View className="flex-row gap-3">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-primary" />
                  <AtelierTypography variant="label" className="text-[10px] text-neutral-400">THU</AtelierTypography>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-secondary" />
                  <AtelierTypography variant="label" className="text-[10px] text-neutral-400">CHI</AtelierTypography>
                </View>
              </View>
            </View>
            
            <View className="items-center">
              {barData.length > 0 ? (
                <BarChart
                  data={barData}
                  barWidth={18}
                  noOfSections={3}
                  barBorderRadius={6}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  height={150}
                  width={SCREEN_WIDTH - 100}
                  spacing={20}
                  xAxisLabelTextStyle={{ fontSize: 10, color: Colors.neutral[400], fontFamily: 'Inter_600SemiBold' }}
                  yAxisTextStyle={{ fontSize: 10, color: Colors.neutral[400] }}
                />
              ) : (
                <View className="h-40 items-center justify-center">
                  <AtelierTypography variant="body" className="text-neutral-300 italic">Chưa có dữ liệu dòng tiền</AtelierTypography>
                </View>
              )}
            </View>
          </AtelierCard>
        </MotiView>
      </ScrollView>
    </View>
  );
}
