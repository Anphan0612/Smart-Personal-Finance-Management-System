import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Target, Sparkles, Plus, Home, Utensils, PartyPopper } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { AtelierTypography, AtelierCard } from "../../components/ui";

export default function BudgetScreen() {
  const [activeTab, setActiveTab] = useState("Management");

  const budgetItems = [
    { icon: Utensils, label: "Food", spent: 1250, limit: 2000, bgColor: "bg-primary-container/10", color: "#005ab4" },
    { icon: Home, label: "Rent", spent: 2200, limit: 2200, bgColor: "bg-secondary-container/10", color: "#465f89" },
    { icon: PartyPopper, label: "Leisure", spent: 450, limit: 1500, bgColor: "bg-tertiary-container/10", color: "#964400" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8"
        >
          <AtelierTypography variant="label" className="text-surface-on-variant mb-1">
            Financial Planning
          </AtelierTypography>
          <AtelierTypography variant="h2" className="text-surface-on">Budget Atelier</AtelierTypography>
        </MotiView>

        {/* Tab Selector */}
        <View className="bg-surface-container rounded-2xl p-1 flex-row mb-8">
           {["Management", "Goals", "Rules"].map((tab) => (
             <TouchableOpacity
               key={tab}
               onPress={() => setActiveTab(tab)}
               className={`flex-1 py-3 rounded-xl ${activeTab === tab ? "bg-white shadow-sm" : ""}`}
             >
               <AtelierTypography 
                variant="label" 
                className={`text-center normal-case ${activeTab === tab ? "text-primary font-bold" : "text-surface-on-variant"}`}
               >
                {tab}
               </AtelierTypography>
             </TouchableOpacity>
           ))}
        </View>

        {/* Total Budget Card */}
        <AtelierCard variant="gradient" elevation="high" padding="lg" className="mb-8">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <AtelierTypography variant="caption" color="rgba(255,255,255,0.8)">Monthly Spendable</AtelierTypography>
              <AtelierTypography variant="h1" color="white" className="mt-1 text-3xl">$4,280.50</AtelierTypography>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <View className="w-[42%] h-full bg-white rounded-full" />
          </View>
          <View className="flex-row justify-between mt-3">
            <AtelierTypography variant="label" color="rgba(255,255,255,0.7)" className="text-[10px]">
              42% Consumed
            </AtelierTypography>
            <AtelierTypography variant="label" color="rgba(255,255,255,0.7)" className="text-[10px]">
              $5,719.50 Left
            </AtelierTypography>
          </View>
        </AtelierCard>

        {/* AI Auto-Budgeting */}
        <AtelierCard elevation="lowest" padding="md" className="bg-surface-container/30 border border-primary/10 mb-8">
          <View className="flex-row items-center gap-3">
             <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                <Sparkles size={18} color="white" fill="white" />
             </View>
             <View className="flex-1">
                <AtelierTypography variant="h3" className="text-sm">Smart Auto-Budgeting</AtelierTypography>
                <AtelierTypography variant="caption" className="text-xs">Based on last 3 months of activity</AtelierTypography>
             </View>
             <TouchableOpacity className="bg-primary px-4 py-2 rounded-full">
                <AtelierTypography variant="label" color="white" className="text-[10px]">Enabled</AtelierTypography>
             </TouchableOpacity>
          </View>
        </AtelierCard>

        {/* Category Breakdown */}
        <View className="mb-8">
          <AtelierTypography variant="h3" className="mb-4">Allocated Budgets</AtelierTypography>
          <View className="gap-4">
            {budgetItems.map((item, idx) => (
              <AtelierCard key={idx} elevation="lowest" padding="md">
                <View className="flex-row justify-between items-center mb-3">
                   <View className="flex-row items-center gap-3">
                      <View className={`w-10 h-10 rounded-full ${item.bgColor} items-center justify-center`}>
                         <item.icon size={20} color={item.color} />
                      </View>
                      <AtelierTypography variant="h3" className="text-sm">{item.label}</AtelierTypography>
                   </View>
                   <AtelierTypography variant="label" className="text-[10px] text-surface-on-variant">
                     ${item.spent} / ${item.limit}
                   </AtelierTypography>
                </View>
                <View className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                   <View 
                    style={{ width: `${(item.spent / item.limit) * 100}%` }} 
                    className={`h-full rounded-full ${item.spent >= item.limit ? "bg-error" : "bg-primary"}`} 
                   />
                </View>
              </AtelierCard>
            ))}
          </View>
        </View>

        {/* Savings Goals */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <AtelierTypography variant="h3">Savings Goals</AtelierTypography>
            <TouchableOpacity><Plus size={20} color="#005ab4" /></TouchableOpacity>
          </View>
          <AtelierCard elevation="lowest" padding="md">
            <View className="flex-row items-center gap-4">
               <View className="w-12 h-12 rounded-full bg-secondary-container/20 items-center justify-center">
                  <Target size={24} color="#465f89" />
               </View>
               <View className="flex-1">
                  <AtelierTypography variant="h3" className="text-sm">New Tesla Model S</AtelierTypography>
                  <AtelierTypography variant="caption" className="text-xs">$12,450 / $80,000 Saved</AtelierTypography>
               </View>
               <AtelierTypography variant="h3" className="text-primary text-sm">15%</AtelierTypography>
            </View>
          </AtelierCard>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
