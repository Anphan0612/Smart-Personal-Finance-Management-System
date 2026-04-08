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

  const isLoading = isBudgetsLoading || isPlanningLoading;

  const totalSpent = budgets?.reduce((s, b) => s + b.currentSpending, 0) ?? 0;
  const targetSpentPct = (planning?.targetSpending ?? 0) > 0 
    ? Math.min((totalSpent / planning!.targetSpending) * 100, 100) 
    : 0;

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
          <TouchableOpacity 
            onPress={handleReset}
            className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center"
          >
            <Trash2 size={22} color="#ef4444" />
          </TouchableOpacity>
        </MotiView>

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
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-1">
                    <Text className="text-white/80 font-medium text-xs mb-1">Monthly Spending Target</Text>
                    <TouchableOpacity onPress={() => { setTempTarget(planning?.targetSpending?.toString() || ""); setTargetModalVisible(true); }}>
                      <Text className="text-white font-headline font-extrabold text-4xl mt-1 tracking-tighter">
                        {planning?.targetSpending ? formatCurrency(planning.targetSpending) : "Set Target"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="items-end">
                    <Text className="text-white/80 font-medium text-[10px] uppercase tracking-wider">Unallocated</Text>
                    <Text className="text-white font-bold text-lg">
                      {formatCurrency(planning?.remainingAmount ?? 0)}
                    </Text>
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
                      
                      <View className="flex-row justify-between mt-2">
                         <Text className="text-[10px] font-bold text-on-surface-variant">{pct.toFixed(0)}% Used</Text>
                         {item.remainingAmount < 0 && (
                           <Text className="text-error text-[10px] font-bold">Overby {formatCurrency(Math.abs(item.remainingAmount))}</Text>
                         )}
                      </View>
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
