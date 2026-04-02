import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { TrendingDown, Sparkles, ArrowRight, Home, Utensils } from "lucide-react-native";
import { LineChart, PieChart, BarChart } from "react-native-gifted-charts";
import { AtelierTypography, AtelierCard } from "../../components/ui";

const { width: screenWidth } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const [timeFilter, setTimeFilter] = useState("Month");

  const spendingData = [
    { value: 80, label: "Jan" },
    { value: 70, label: "Feb" },
    { value: 85, label: "Mar" },
    { value: 40, label: "Apr" },
    { value: 60, label: "May" },
    { value: 20, label: "Jun" },
  ];

  const pieData = [
    { value: 45, color: "#005ab4", text: "45%" },
    { value: 30, color: "#b7cfff", text: "30%" },
    { value: 25, color: "#ecedf7", text: "25%" },
  ];

  // Simplified Bar Data to avoid potential gifted-charts errors
  const chartData = [
    { value: 80, label: "M", frontColor: "#005ab4", spacing: 4 },
    { value: 60, frontColor: "#465f89", spacing: 18 },
    { value: 95, label: "A", frontColor: "#005ab4", spacing: 4 },
    { value: 45, frontColor: "#465f89", spacing: 18 },
    { value: 70, label: "M", frontColor: "#005ab4", spacing: 4 },
    { value: 55, frontColor: "#465f89", spacing: 18 },
    { value: 85, label: "J", frontColor: "#005ab4", spacing: 4 },
    { value: 30, frontColor: "#465f89" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header & Filter */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8"
        >
          <AtelierTypography variant="label" className="text-surface-on-variant mb-1">
            Financial Performance
          </AtelierTypography>
          <View className="flex-row justify-between items-end">
            <AtelierTypography variant="h2" className="text-surface-on">Analytics</AtelierTypography>
            <View className="bg-surface-container rounded-full p-1 flex-row">
              {["Week", "Month", "Year"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTimeFilter(item)}
                  className={`px-4 py-2 rounded-full ${timeFilter === item ? "bg-white shadow-sm" : ""}`}
                >
                  <AtelierTypography 
                    variant="label" 
                    className={`text-[10px] normal-case ${timeFilter === item ? "text-primary font-bold" : "text-surface-on-variant"}`}
                  >
                    {item}
                  </AtelierTypography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Spending Trend Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
          className="mb-8"
        >
          <AtelierCard elevation="lowest" padding="lg">
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <AtelierTypography variant="h3" className="text-lg">Spending Trends</AtelierTypography>
                <AtelierTypography variant="caption" className="text-xs">Monthly cash flow</AtelierTypography>
              </View>
              <View className="items-end">
                <AtelierTypography variant="h2" className="text-primary text-xl">$4,280.50</AtelierTypography>
                <View className="flex-row items-center">
                  <TrendingDown size={14} color="#465f89" />
                  <AtelierTypography variant="label" className="text-secondary text-[10px] ml-1">8.2% vs last month</AtelierTypography>
                </View>
              </View>
            </View>
            <View className="h-40 items-center justify-center">
              <LineChart
                data={spendingData}
                height={120}
                width={screenWidth - 100}
                noOfSections={3}
                color="#005ab4"
                thickness={3}
                areaChart
                startFillColor="#005ab4"
                endFillColor="#1a73e8"
                startOpacity={0.1}
                endOpacity={0}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                hideDataPoints
                yAxisTextStyle={{ color: "#717785", fontSize: 10 }}
                xAxisLabelTextStyle={{ color: "#717785", fontSize: 10 }}
              />
            </View>
          </AtelierCard>
        </MotiView>

        {/* AI Insight Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          className="mb-8"
        >
          <AtelierCard variant="gradient" elevation="high" padding="lg" className="relative overflow-hidden">
            <View className="flex-row items-center gap-2 mb-4">
              <Sparkles size={20} color="white" fill="white" />
              <AtelierTypography variant="h3" color="white" className="text-lg">AI Strategy</AtelierTypography>
            </View>
            <AtelierTypography variant="body" color="rgba(255,255,255,0.9)" className="mb-6">
              "You could save <AtelierTypography className="font-bold text-secondary-container">$300</AtelierTypography> this month by reducing <AtelierTypography className="font-bold italic text-secondary-container">'Dining Out'</AtelierTypography> frequency."
            </AtelierTypography>
            <TouchableOpacity className="bg-white py-4 rounded-full flex-row items-center justify-center gap-2">
              <AtelierTypography variant="label" className="text-primary font-bold">Optimize Strategy</AtelierTypography>
              <ArrowRight size={16} color="#005ab4" />
            </TouchableOpacity>
          </AtelierCard>
        </MotiView>

        <View className="flex-row gap-6 mb-8">
          {/* Category Pie */}
          <View className="flex-1">
            <AtelierCard elevation="lowest" padding="md">
              <AtelierTypography variant="h3" className="text-sm mb-4">Categories</AtelierTypography>
              <View className="items-center">
                <PieChart
                  data={pieData}
                  donut
                  radius={40}
                  innerRadius={30}
                  innerCircleColor={"white"}
                  centerLabelComponent={() => (
                    <AtelierTypography variant="h3" className="text-[10px]">$4.2k</AtelierTypography>
                  )}
                />
              </View>
              <View className="mt-4 gap-2">
                {pieData.map((item, idx) => (
                  <View key={idx} className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <AtelierTypography variant="caption" className="text-[8px]">{item.text}</AtelierTypography>
                  </View>
                ))}
              </View>
            </AtelierCard>
          </View>

          {/* Income vs Expense Bar */}
          <View className="flex-[1.5]">
            <AtelierCard elevation="lowest" padding="md">
              <AtelierTypography variant="h3" className="text-sm mb-4">Cash Flow</AtelierTypography>
              <View className="items-center">
                <BarChart
                  data={chartData}
                  barWidth={10}
                  height={100}
                  width={screenWidth / 2.5}
                  noOfSections={3}
                  barBorderRadius={3}
                  yAxisTextStyle={{ color: "#717785", fontSize: 8 }}
                  xAxisLabelTextStyle={{ color: "#717785", fontSize: 8 }}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  isAnimated={false}
                />
              </View>
            </AtelierCard>
          </View>
        </View>

        {/* Top Categories List */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 300 }}
        >
          <AtelierTypography variant="h3" className="mb-4">Top Categories</AtelierTypography>
          <View className="gap-3">
             <AtelierCard elevation="lowest" padding="md" className="bg-surface-container/20">
               <View className="flex-row justify-between items-center">
                 <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm">
                      <Home size={24} color="#005ab4" />
                    </View>
                    <View>
                      <AtelierTypography variant="h3" className="text-sm">Housing</AtelierTypography>
                      <AtelierTypography variant="caption" className="text-xs">Mortgage & Utilities</AtelierTypography>
                    </View>
                 </View>
                 <View className="items-end">
                    <AtelierTypography variant="h3" className="text-sm">$1,850.00</AtelierTypography>
                    <AtelierTypography variant="label" className="text-primary text-[10px]">Planned</AtelierTypography>
                 </View>
               </View>
             </AtelierCard>

             <AtelierCard elevation="lowest" padding="md" className="bg-surface-container/20">
               <View className="flex-row justify-between items-center">
                 <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm">
                      <Utensils size={24} color="#465f89" />
                    </View>
                    <View>
                      <AtelierTypography variant="h3" className="text-sm">Dining Out</AtelierTypography>
                      <AtelierTypography variant="caption" className="text-xs">Restaurants & Bars</AtelierTypography>
                    </View>
                 </View>
                 <View className="items-end">
                    <AtelierTypography variant="h3" className="text-sm text-error">$840.20</AtelierTypography>
                    <AtelierTypography variant="label" className="text-error text-[10px]">+15% VS AVG</AtelierTypography>
                 </View>
               </View>
             </AtelierCard>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
