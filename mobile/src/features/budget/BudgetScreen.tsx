import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Modal, 
  TextInput,
  Alert,
  StyleSheet
} from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { 
  Target, 
  Sparkles, 
  Plus, 
  AlertTriangle,
  TrendingDown,
  X,
  Trash2,
  ChevronRight,
  Info
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { useBudgets, useBudgetPlanning, useResetBudget, useUpsertBudget } from "../../hooks/useBudgets";
import { useCategories } from "../../hooks/useCategories";
import { formatCurrency } from "../../utils/format";
import { Skeleton } from "../../components/common/Skeleton";
import type { BudgetResponse, ThresholdStatus } from "../../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THRESHOLD_COLORS: Record<ThresholdStatus, string> = {
  COMFORT: "#10b981",
  PACING: "#f59e0b",
  DANGER: "#f97316",
  OVERBUDGET: "#ef4444",
};

const THRESHOLD_BG: Record<ThresholdStatus, string> = {
  COMFORT: "bg-[#10b981]",
  PACING: "bg-[#f59e0b]",
  DANGER: "bg-[#f97316]",
  OVERBUDGET: "bg-error",
};

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  
  // Data Hooks
  const { data: budgets, isLoading: isBudgetsLoading, refetch: refetchBudgets } = useBudgets(month, year);
  const { data: planning, isLoading: isPlanningLoading, refetch: refetchPlanning } = useBudgetPlanning(month, year);
  const { data: categories } = useCategories();
  const upsertBudget = useUpsertBudget();
  const resetBudget = useResetBudget();

  // Component State
  const [isTargetModalVisible, setTargetModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [tempTarget, setTempTarget] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAmount, setCategoryAmount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const isLoading = isBudgetsLoading || isPlanningLoading;
  const totalSpent = budgets?.reduce((s, b) => s + b.currentSpending, 0) ?? 0;
  
  // New Calculation: Total Allocated across all categories
  const totalAllocated = useMemo(() => {
    return budgets?.filter(b => b.categoryId !== null).reduce((s, b) => s + b.limitAmount, 0) ?? 0;
  }, [budgets]);

  const targetSpentPct = (planning?.targetSpending ?? 0) > 0 
    ? Math.min((totalSpent / planning!.targetSpending) * 100, 100) 
    : 0;

  // Mismatch Detection logic
  const isMismatched = planning && totalAllocated > planning.targetSpending;
  const mismatchAmount = isMismatched ? totalAllocated - planning.targetSpending : 0;

  const handleReset = () => {
    Alert.alert(
      "Reset Budget",
      "Are you sure you want to clear all budget settings for this month? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => resetBudget.mutate({ month, year })
        }
      ]
    );
  };

  const handleAutoAdjust = async () => {
    if (!planning || !budgets) return;
    const target = planning.targetSpending;
    const allocated = totalAllocated;
    
    if (allocated <= target) return;

    const scalingFactor = target / allocated;

    Alert.alert(
      "Auto Adjust Budgets",
      `This will proportionally reduce your category budgets to fit within the ${formatCurrency(target)} limit. Proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Adjust All", 
          onPress: async () => {
            try {
              // Proportional reduction
              const updates = budgets
                .filter(b => b.categoryId !== null)
                .map(b => {
                  const newAmount = Math.floor((b.limitAmount * scalingFactor) / 10000) * 10000; // Round to 10k
                  return upsertBudget.mutateAsync({
                    categoryId: b.categoryId,
                    amount: newAmount,
                    month,
                    year
                  });
                });
              
              await Promise.all(updates);
              Alert.alert("Success", "All category budgets have been adjusted.");
            } catch (error) {
              Alert.alert("Error", "Failed to adjust some budgets. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleSaveTarget = () => {
    const amount = parseFloat(tempTarget);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    upsertBudget.mutate({
      categoryId: null,
      amount,
      month,
      year
    }, {
      onSuccess: () => setTargetModalVisible(false)
    });
  };

  const handleSaveCategoryBudget = () => {
    if (!selectedCategory) return;
    upsertBudget.mutate({
      categoryId: selectedCategory,
      amount: categoryAmount,
      month,
      year
    }, {
      onSuccess: () => {
        setCategoryModalVisible(false);
        setSelectedCategory(null);
        setCategoryAmount(0);
      }
    });
  };

  const remainingForSlider = useMemo(() => {
    if (!planning) return 0;
    // If editing existing budget, the pool is remaining + current limit of that category
    const existing = budgets?.find(b => b.categoryId === selectedCategory);
    return (planning.remainingAmount || 0) + (existing?.limitAmount || 0);
  }, [planning, selectedCategory, budgets]);

  return (
    <View className="flex-1 bg-surface">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={false} 
            onRefresh={() => { refetchBudgets(); refetchPlanning(); }} 
            tintColor="#005ab4" 
          />
        }
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8 flex-row justify-between items-end"
        >
          <View>
            <Text className="font-headline text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-1">
              Financial Planning • {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now)}
            </Text>
            <Text className="font-headline font-extrabold text-3xl text-on-surface">Budget Atelier</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-full border ${isEditing ? "bg-primary border-primary" : "bg-surface-container-high border-outline/10"}`}
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${isEditing ? "text-white" : "text-on-surface-variant"}`}>
                {isEditing ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleReset}
              className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center"
            >
              <Trash2 size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </MotiView>
        
        {/* Mismatch Alert Section */}
        <AnimatePresence>
          {isMismatched && (
            <MotiView
              from={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-error/10 p-6 rounded-[32px] border border-error/20"
            >
              <View className="flex-row items-center gap-3 mb-3">
                <AlertTriangle size={20} color="#ef4444" />
                <Text className="font-headline font-bold text-error text-[15px]">Budget Conflict</Text>
              </View>
              <Text className="text-xs text-on-surface-variant leading-5 font-medium mb-5">
                Your total category budgets ({formatCurrency(totalAllocated)}) exceed your monthly target ({formatCurrency(planning?.targetSpending || 0)}) by <Text className="text-error font-bold">{formatCurrency(mismatchAmount)}</Text>.
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                   onPress={handleAutoAdjust}
                   className="flex-1 bg-error py-3 rounded-full items-center justify-center"
                >
                  <Text className="text-white font-bold text-[10px] uppercase tracking-wider">Auto Adjust</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => Alert.alert("Manual Adjust", "Please decrease limits on specific categories below.")}
                   className="flex-1 bg-surface-container-high py-3 rounded-full items-center justify-center"
                >
                  <Text className="text-on-surface font-bold text-[10px] uppercase tracking-wider">Review Categories</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* Top-Down Target Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" }}
          className="mb-8"
        >
          <LinearGradient
            colors={["#005ab4", "#0873df"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 rounded-[32px] shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <View>
                <Skeleton width={140} height={16} radius={8} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 }} />
                <Skeleton width={220} height={40} radius={8} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-white/80 font-medium text-xs mb-1">Monthly Spending Target</Text>
                    <TouchableOpacity onPress={() => { setTempTarget(planning?.targetSpending?.toString() || ""); setTargetModalVisible(true); }}>
                      <Text className="text-white font-headline font-extrabold text-4xl mt-1 tracking-tighter">
                        {planning?.targetSpending ? formatCurrency(planning.targetSpending) : "Set Target"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="items-end bg-white/20 px-3 py-1.5 rounded-2xl">
                    <Text className="text-white/80 font-bold text-[10px] uppercase tracking-wider">Unallocated</Text>
                    <Text className="text-white font-bold text-md">
                      {formatCurrency(planning?.remainingAmount ?? 0)}
                    </Text>
                  </View>
                </View>

                {/* TARGET SLIDER INSIDE CARD */}
                <View className="mb-6">
                   <Slider
                    style={{ width: '100%', height: 32 }}
                    minimumValue={5000000}
                    maximumValue={100000000}
                    step={500000}
                    value={planning?.targetSpending || 15000000}
                    onSlidingComplete={(val) => {
                      upsertBudget.mutate({ categoryId: null, amount: val, month, year });
                    }}
                    minimumTrackTintColor="#ffffff"
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    thumbTintColor="#ffffff"
                  />
                  <View className="flex-row justify-between px-1">
                    <Text className="text-white/50 text-[10px] font-bold">5M</Text>
                    <Text className="text-white/50 text-[10px] font-bold">100M</Text>
                  </View>
                </View>

                {/* Progress Bar of Target vs Actual Spent */}
                <View className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <MotiView 
                    from={{ width: "0%" }}
                    animate={{ width: `${targetSpentPct}%` }}
                    transition={{ delay: 500, type: "timing", duration: 1000 }}
                    className="h-full bg-white rounded-full" 
                  />
                </View>
                <View className="flex-row justify-between mt-4">
                  <View className="flex-row items-center gap-2">
                    <Sparkles size={12} color="white" />
                    <Text className="text-white/70 text-[10px] font-bold">
                      {formatCurrency(totalSpent)} spent out of target
                    </Text>
                  </View>
                  <Text className="text-white/70 text-[10px] font-bold">
                    {targetSpentPct.toFixed(0)}% Utilized
                  </Text>
                </View>
              </>
            )}
          </LinearGradient>
        </MotiView>

        {/* Allocated Budgets Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-headline font-bold text-xl text-on-surface">Allocated</Text>
            <TouchableOpacity 
              onPress={() => {
                if (!planning?.targetSpending) {
                  Alert.alert("No Target", "Please set a Monthly Spending Target first.");
                  return;
                }
                if (planning.remainingAmount <= 0) {
                  Alert.alert("Limit Reached", "You have no remaining funds to allocate. Increase your target spending or reduce other budgets.");
                  return;
                }
                setCategoryModalVisible(true);
              }}
              className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-full"
            >
              <Plus size={16} color="#005ab4" />
              <Text className="text-primary font-bold text-xs text-center">Add Category</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} width="100%" height={90} radius={24} />)
            ) : !budgets || budgets.filter(b => b.categoryId != null).length === 0 ? (
              <View className="bg-white p-10 rounded-[32px] border border-dashed border-outline/30 items-center justify-center">
                <View className="w-16 h-16 bg-surface-container rounded-full items-center justify-center mb-4">
                  <Target size={32} color="#9ca3af" />
                </View>
                <Text className="text-on-surface-variant font-bold text-sm text-center mb-2">No category budgets set</Text>
                <Text className="text-on-surface-variant/60 text-xs text-center">Break down your {formatCurrency(planning?.targetSpending || 0)} into specific goals.</Text>
              </View>
            ) : (
              budgets.filter(b => b.categoryId != null).map((item, idx) => {
                const pct = Math.min(item.percentageUsed, 100);
                const status = item.thresholdStatus as ThresholdStatus;
                const barColor = THRESHOLD_BG[status] || "bg-primary";
                const statusColor = THRESHOLD_COLORS[status] || "#005ab4";

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setSelectedCategory(item.categoryId);
                      setCategoryAmount(item.limitAmount);
                      setCategoryModalVisible(true);
                    }}
                  >
                    <MotiView
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: 100 * idx }}
                      className="bg-white p-5 rounded-[28px] shadow-sm border border-outline/5"
                    >
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center gap-3">
                          <View 
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: `${statusColor}15` }}
                          >
                             <Target size={20} color={statusColor} />
                          </View>
                          <View>
                            <Text className="font-headline font-bold text-on-surface text-[15px]">{item.categoryName}</Text>
                            <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                              {formatCurrency(item.currentSpending)} spent
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="font-bold text-on-surface text-sm">{formatCurrency(item.limitAmount)}</Text>
                          <Text className="text-[10px] font-bold text-on-surface-variant uppercase">LIMIT</Text>
                        </View>
                      </View>
                      
                      <View className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <View 
                          className={`h-full rounded-full ${barColor}`} 
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                      
                      {isEditing ? (
                        <MotiView
                          from={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-surface-container"
                        >
                           <Slider
                            style={{ width: '100%', height: 32 }}
                            minimumValue={0}
                            maximumValue={item.limitAmount + (planning?.remainingAmount || 0)}
                            step={100000}
                            value={item.limitAmount}
                            onSlidingComplete={(val) => {
                              upsertBudget.mutate({ 
                                categoryId: item.categoryId, 
                                amount: val, 
                                month, 
                                year 
                              });
                            }}
                            minimumTrackTintColor={statusColor}
                            maximumTrackTintColor="#f2f3fd"
                            thumbTintColor={statusColor}
                          />
                          <View className="flex-row justify-between px-1">
                            <Text className="text-[8px] font-bold text-on-surface-variant">0</Text>
                            <Text className="text-[8px] font-bold text-on-surface-variant">
                              MAX: {formatCurrency(item.limitAmount + (planning?.remainingAmount || 0))}
                            </Text>
                          </View>
                        </MotiView>
                      ) : (
                        <View className="flex-row justify-between mt-2">
                           <Text className="text-[10px] font-bold text-on-surface-variant">{pct.toFixed(0)}% Used</Text>
                           {item.remainingAmount < 0 && (
                             <Text className="text-error text-[10px] font-bold">Over by {formatCurrency(Math.abs(item.remainingAmount))}</Text>
                           )}
                        </View>
                      )}
                    </MotiView>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Tips Section */}
        <MotiView
           from={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="bg-primary/5 p-6 rounded-[32px] border border-primary/10"
        >
          <View className="flex-row items-center gap-3 mb-2">
            <Info size={18} color="#005ab4" />
            <Text className="font-headline font-bold text-primary text-sm">Smart Tip</Text>
          </View>
          <Text className="text-xs text-on-surface-variant leading-5 font-medium">
             Your budgets are constrained by your Monthly Target. This helps you ensure you don't over-allocate money you don't have.
          </Text>
        </MotiView>
      </ScrollView>

      {/* --- MODALS --- */}

      {/* Target Spending Modal */}
      <Modal visible={isTargetModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-end">
          <MotiView 
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            className="bg-white rounded-t-[40px] p-8 pb-12"
          >
            <View className="flex-row justify-between items-center mb-8">
              <Text className="font-headline font-extrabold text-2xl">Spending Target</Text>
              <TouchableOpacity
                onPress={() => setTargetModalVisible(false)}
                className="w-12 h-12 items-center justify-center bg-surface-container rounded-full"
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-on-surface-variant font-medium text-sm mb-4">Set your total spending limit for this month.</Text>
            
            <View className="bg-surface-container rounded-[24px] p-6 mb-8">
              <TextInput
                value={tempTarget}
                onChangeText={setTempTarget}
                placeholder="Enter amount (e.g. 10000000)"
                keyboardType="numeric"
                className="font-headline font-bold text-3xl text-primary text-center"
                autoFocus
              />
              <Text className="text-center text-[10px] font-bold text-on-surface-variant mt-2 uppercase">Amount in VNĐ</Text>
            </View>

            <TouchableOpacity 
              onPress={handleSaveTarget}
              className="bg-primary py-5 rounded-[24px] items-center"
            >
              <Text className="text-white font-bold text-lg text-center">Define Target</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      {/* Category Budget Modal with Slider */}
      <Modal visible={isCategoryModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-end">
          <MotiView 
            from={{ translateY: 400 }}
            animate={{ translateY: 0 }}
            className="bg-white rounded-t-[40px] p-8 pb-12"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-headline font-extrabold text-2xl">Allocate Budget</Text>
              <TouchableOpacity
                onPress={() => { setCategoryModalVisible(false); setSelectedCategory(null); }}
                className="w-12 h-12 items-center justify-center bg-surface-container rounded-full"
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Category Selector if New */}
            {!selectedCategory && (
              <View className="mb-6">
                <Text className="font-bold text-xs text-on-surface-variant uppercase mb-3 px-2">Select Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
                  {categories?.map(cat => (
                    <TouchableOpacity 
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      className={`mr-3 px-6 py-3 rounded-full border ${selectedCategory === cat.id ? "bg-primary border-primary" : "bg-white border-outline/20"}`}
                    >
                      <Text className={`font-bold text-xs ${selectedCategory === cat.id ? "text-white" : "text-on-surface"}`}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedCategory && (
              <View>
                <View className="flex-row justify-between items-center mb-2 px-2">
                   <Text className="font-bold text-sm text-on-surface">Budget Limit</Text>
                   <Text className="font-headline font-bold text-xl text-primary">{formatCurrency(categoryAmount)}</Text>
                </View>

                {/* SLIDER COMPONENT */}
                <View className="my-8">
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={remainingForSlider}
                    step={100000} // Unit of 100k
                    value={categoryAmount}
                    onValueChange={setCategoryAmount}
                    minimumTrackTintColor="#005ab4"
                    maximumTrackTintColor="#e2e8f0"
                    thumbTintColor="#005ab4"
                  />
                  <View className="flex-row justify-between px-2 mt-2">
                    <Text className="text-[10px] font-bold text-on-surface-variant">0</Text>
                    <Text className="text-[10px] font-bold text-on-surface-variant">Max: {formatCurrency(remainingForSlider)}</Text>
                  </View>
                </View>

                {/* PRESETS */}
                <View className="flex-row gap-2 mb-8 px-2">
                   {[0.25, 0.5, 1].map(factor => {
                     const val = Math.floor(remainingForSlider * factor / 100000) * 100000;
                     return (
                       <TouchableOpacity 
                         key={factor}
                         onPress={() => setCategoryAmount(val)}
                         className="flex-1 bg-surface-container py-3 rounded-2xl items-center border border-outline/5"
                       >
                         <Text className="text-[10px] font-bold text-primary uppercase">
                           {factor === 1 ? "Max" : `${factor * 100}%`}
                         </Text>
                       </TouchableOpacity>
                     );
                   })}
                </View>

                <TouchableOpacity 
                  onPress={handleSaveCategoryBudget}
                  disabled={categoryAmount <= 0}
                  className={`py-5 rounded-[24px] items-center ${categoryAmount <= 0 ? "bg-surface-container" : "bg-primary"}`}
                >
                  <Text className={`font-bold text-lg ${categoryAmount <= 0 ? "text-on-surface-variant" : "text-white"}`}>
                    Apply Budget
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  }
});
