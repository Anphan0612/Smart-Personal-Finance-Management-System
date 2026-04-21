import React, { useState, useMemo } from "react";
import { 
  View, 
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
  Info
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { useBudgets, useBudgetPlanning, useResetBudget, useUpsertBudget } from "../../hooks/useBudgets";
import { useCategories } from "../../hooks/useCategories";
import { formatCurrency } from "../../utils/format";
import type { BudgetResponse, ThresholdStatus } from "../../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { renderKey, ID_PREFIX } from "@/utils/id";
import { 
  AtelierTypography, 
  AtelierCard, 
  SkeletonBox 
} from "@/components/ui";
import { Colors } from "@/constants/tokens";

const THRESHOLD_COLORS: Record<ThresholdStatus, string> = {
  COMFORT: "#10b981", // Success green
  PACING: "#f59e0b", // Warning amber
  DANGER: "#f97316", // Danger orange
  OVERBUDGET: "#ef4444", // Error red
};

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  
  // Data Hooks
  const { data: budgets, isLoading: isBudgetsLoading, refetch: refetchBudgets, isRefetching: isRefetchingBudgets } = useBudgets(month, year);
  const { data: planning, isLoading: isPlanningLoading, refetch: refetchPlanning, isRefetching: isRefetchingPlanning } = useBudgetPlanning(month, year);
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
  const isRefreshing = isRefetchingBudgets || isRefetchingPlanning;
  const totalSpent = budgets?.reduce((s, b) => s + b.currentSpending, 0) ?? 0;
  
  const totalAllocated = useMemo(() => {
    return budgets?.filter(b => b.categoryId !== null).reduce((s, b) => s + b.limitAmount, 0) ?? 0;
  }, [budgets]);

  const targetSpentPct = (planning?.targetSpending ?? 0) > 0 
    ? Math.min((totalSpent / planning!.targetSpending) * 100, 100) 
    : 0;

  const isMismatched = planning && totalAllocated > planning.targetSpending;
  const mismatchAmount = isMismatched ? totalAllocated - planning.targetSpending : 0;

  const handleReset = () => {
    Alert.alert(
      "Đặt lại ngân sách",
      "Bạn có chắc muốn xóa tất cả thiết lập ngân sách tháng này không? Thao tác này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đặt lại", 
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
      "Tự động điều chỉnh",
      `Hệ thống sẽ giảm tỷ lệ ngân sách các danh mục để khớp với giới hạn ${formatCurrency(target)}. Tiếp tục?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          onPress: async () => {
            try {
              const updates = budgets
                .filter(b => b.categoryId !== null)
                .map(b => {
                  const newAmount = Math.floor((b.limitAmount * scalingFactor) / 10000) * 10000;
                  return upsertBudget.mutateAsync({
                    categoryId: b.categoryId,
                    amount: newAmount,
                    month,
                    year
                  });
                });
              
              await Promise.all(updates);
              Alert.alert("Thành công", "Ngân sách đã được điều chỉnh tự động.");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể điều chỉnh một số ngân sách. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  const handleSaveTarget = () => {
    const amount = parseFloat(tempTarget);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ.");
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
    const existing = budgets?.find(b => b.categoryId === selectedCategory);
    return (planning.remainingAmount || 0) + (existing?.limitAmount || 0);
  }, [planning, selectedCategory, budgets]);

  return (
    <View className="flex-1 bg-surface-lowest">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 88, paddingHorizontal: 24, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => { refetchBudgets(); refetchPlanning(); }} 
            tintColor={Colors.primary.DEFAULT}
            colors={[Colors.primary.DEFAULT]}
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
            <AtelierTypography variant="label" className="text-neutral-400 mb-1 uppercase">
              KẾ HOẠCH TÀI CHÍNH • {new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(now)}
            </AtelierTypography>
            <AtelierTypography variant="h1" className="text-neutral-900">Ngân sách.</AtelierTypography>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              className={`px-5 py-2.5 rounded-full border ${isEditing ? "bg-primary border-primary" : "bg-white border-neutral-100"}`}
            >
              <AtelierTypography variant="label" color={isEditing ? "white" : "neutral"} className="uppercase">
                {isEditing ? "Xong" : "Sửa"}
              </AtelierTypography>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleReset}
              className="w-12 h-12 rounded-2xl bg-white border border-neutral-100 items-center justify-center shadow-atelier-low"
            >
              <Trash2 size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </MotiView>
        
        {/* Mismatch Alert Section */}
        <AnimatePresence>
          {isMismatched && (
            <MotiView
              key="budget-mismatch-alert"
              from={{ opacity: 0, height: 0, scale: 0.8 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.8 }}
              className="mb-8 overflow-hidden"
            >
              <AtelierCard variant="elevated" padding="md" className="bg-red-50 border border-red-100">
                <View className="flex-row items-center gap-2 mb-2">
                  <AlertTriangle size={20} color={Colors.error} />
                  <AtelierTypography variant="h3" className="text-red-700">Xung đột ngân sách</AtelierTypography>
                </View>
                <AtelierTypography variant="body" className="text-red-600 mb-6">
                  Tổng ngân sách danh mục ({formatCurrency(totalAllocated)}) vượt quá mục tiêu chi tiêu tháng ({formatCurrency(planning?.targetSpending || 0)}) tới {formatCurrency(mismatchAmount)}.
                </AtelierTypography>
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                     onPress={handleAutoAdjust}
                     className="flex-1 bg-red-600 py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-red-200"
                  >
                    <AtelierTypography variant="label" color="white" className="uppercase">Tự điều chỉnh</AtelierTypography>
                  </TouchableOpacity>
                  <TouchableOpacity 
                     onPress={() => Alert.alert("Điều chỉnh thủ công", "Vui lòng giảm giới hạn ngân sách ở các danh mục bên dưới.")}
                     className="flex-1 bg-white border border-red-200 py-3.5 rounded-2xl items-center justify-center"
                  >
                    <AtelierTypography variant="label" className="text-red-600 uppercase">Xem xét lại</AtelierTypography>
                  </TouchableOpacity>
                </View>
              </AtelierCard>
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
            colors={[Colors.primary.DEFAULT, "#0072e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 rounded-[40px] shadow-2xl shadow-primary/20"
          >
            {isLoading ? (
              <View>
                <SkeletonBox width={140} height={16} radius={8} className="bg-white/20 mb-3" />
                <SkeletonBox width={220} height={40} radius={8} className="bg-white/20" />
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-1">
                    <AtelierTypography variant="label" color="white" className="opacity-80 mb-2">MỤC TIÊU CHI TIÊU THÁNG</AtelierTypography>
                    <TouchableOpacity onPress={() => { setTempTarget(planning?.targetSpending?.toString() || ""); setTargetModalVisible(true); }}>
                      <AtelierTypography variant="h1" color="white" className="text-4xl tracking-tighter">
                        {planning?.targetSpending ? formatCurrency(planning.targetSpending) : "Đặt mục tiêu"}
                      </AtelierTypography>
                    </TouchableOpacity>
                  </View>
                  <View className="bg-white/20 px-3 py-1 rounded-2xl">
                    <AtelierTypography variant="label" color="white" className="text-[10px] opacity-80 uppercase">CHƯA PHÂN BỔ</AtelierTypography>
                    <AtelierTypography variant="h3" color="white">
                      {formatCurrency(planning?.remainingAmount ?? 0)}
                    </AtelierTypography>
                  </View>
                </View>

                {/* Slider Component with tokens */}
                <View className="mb-6">
                   <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={5000000}
                    maximumValue={100000000}
                    step={1000000}
                    value={planning?.targetSpending || 15000000}
                    onSlidingComplete={(val) => {
                      upsertBudget.mutate({ categoryId: null, amount: val, month, year });
                    }}
                    minimumTrackTintColor="#ffffff"
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    thumbTintColor="#ffffff"
                  />
                  <View className="flex-row justify-between px-1">
                    <AtelierTypography variant="caption" color="white" className="opacity-50">5M</AtelierTypography>
                    <AtelierTypography variant="caption" color="white" className="opacity-50">100M</AtelierTypography>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <MotiView 
                    from={{ width: "0%" }}
                    animate={{ width: `${targetSpentPct}%` }}
                    transition={{ delay: 500, type: "timing", duration: 1000 }}
                    className="h-full bg-white rounded-full" 
                  />
                </View>
                <View className="flex-row justify-between mt-4">
                  <View className="flex-row items-center gap-2">
                    <Sparkles size={14} color="white" />
                    <AtelierTypography variant="label" color="white" className="opacity-80">
                      Đã chi {formatCurrency(totalSpent)}
                    </AtelierTypography>
                  </View>
                  <AtelierTypography variant="label" color="white" className="opacity-80">
                    {targetSpentPct.toFixed(0)}% Đạt được
                  </AtelierTypography>
                </View>
              </>
            )}
          </LinearGradient>
        </MotiView>

        {/* Allocated Budgets Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <AtelierTypography variant="h2">Phân bổ</AtelierTypography>
            <TouchableOpacity 
              onPress={() => {
                if (!planning?.targetSpending) {
                  Alert.alert("Chưa có mục tiêu", "Vui lòng đặt Mục tiêu chi tiêu hàng tháng trước.");
                  return;
                }
                if (planning.remainingAmount <= 0) {
                  Alert.alert("Hết hạn mức", "Bạn không còn ngân sách trống để phân bổ. Hãy tăng mục tiêu chi tiêu hoặc giảm bớt các ngân sách khác.");
                  return;
                }
                setCategoryModalVisible(true);
              }}
              className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl"
            >
              <Plus size={16} color={Colors.primary.DEFAULT} />
              <AtelierTypography variant="label" className="text-primary font-bold">Thêm danh mục</AtelierTypography>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {isLoading ? (
              [1, 2, 3].map(i => <SkeletonBox key={i} width="100%" height={90} radius={28} className="mb-2" />)
            ) : !budgets || budgets.filter(b => b.categoryId != null).length === 0 ? (
              <AtelierCard variant="elevated" className="p-10 bg-white border border-dashed border-neutral-200 items-center justify-center">
                <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center mb-4">
                  <Target size={32} color={Colors.neutral[300]} />
                </View>
                <AtelierTypography variant="h3" className="text-neutral-400 text-center mb-1">Chưa phân bổ ngân sách</AtelierTypography>
                <AtelierTypography variant="body" className="text-neutral-400/60 text-xs text-center">Hãy chia nhỏ {formatCurrency(planning?.targetSpending || 0)} thành các mục tiêu cụ thể.</AtelierTypography>
              </AtelierCard>
            ) : (
              budgets.filter(b => b.categoryId != null).map((item, idx) => {
                const pct = Math.min(item.percentageUsed, 100);
                const status = item.thresholdStatus as ThresholdStatus;
                const statusColor = THRESHOLD_COLORS[status] || Colors.primary.DEFAULT;
                const categoryKey = renderKey(ID_PREFIX.CATEGORY, (item.id || item.categoryId)!, idx);

                return (
                  <TouchableOpacity
                    key={categoryKey}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCategory(item.categoryId);
                      setCategoryAmount(item.limitAmount);
                      setCategoryModalVisible(true);
                    }}
                  >
                    <AtelierCard padding="md" className="bg-white border border-neutral-100 shadow-atelier-low">
                      <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-4">
                          <View 
                            className="w-12 h-12 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: `${statusColor}10` }}
                          >
                             <Target size={22} color={statusColor} />
                          </View>
                          <View>
                            <AtelierTypography variant="h3">{item.categoryName}</AtelierTypography>
                            <AtelierTypography variant="label" className="text-neutral-400 text-[10px] uppercase">
                              Đã tiêu {formatCurrency(item.currentSpending)}
                            </AtelierTypography>
                          </View>
                        </View>
                        <View className="items-end">
                          <AtelierTypography variant="h3">{formatCurrency(item.limitAmount)}</AtelierTypography>
                          <AtelierTypography variant="label" className="text-neutral-400 text-[10px] uppercase">GIỚI HẠN</AtelierTypography>
                        </View>
                      </View>
                      
                      <View className="w-full h-2 bg-neutral-50 rounded-full overflow-hidden">
                        <View 
                          className="h-full rounded-full" 
                          style={{ width: `${pct}%`, backgroundColor: statusColor }}
                        />
                      </View>
                      
                      {isEditing ? (
                        <MotiView
                          from={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-neutral-50"
                        >
                           <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={0}
                            maximumValue={item.limitAmount + (planning?.remainingAmount || 0)}
                            step={500000}
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
                            maximumTrackTintColor="#f0f0f5"
                            thumbTintColor={statusColor}
                          />
                          <View className="flex-row justify-between px-1">
                            <AtelierTypography variant="caption" className="text-neutral-400">0</AtelierTypography>
                            <AtelierTypography variant="caption" className="text-neutral-400">
                              MAX: {formatCurrency(item.limitAmount + (planning?.remainingAmount || 0))}
                            </AtelierTypography>
                          </View>
                        </MotiView>
                      ) : (
                        <View className="flex-row justify-between mt-3">
                           <AtelierTypography variant="label" className="text-neutral-400 font-bold">{pct.toFixed(0)}% Đã sử dụng</AtelierTypography>
                           {item.remainingAmount < 0 && (
                             <AtelierTypography variant="label" className="text-error font-bold">Vượt {formatCurrency(Math.abs(item.remainingAmount))}</AtelierTypography>
                           )}
                        </View>
                      )}
                    </AtelierCard>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Tips Section */}
        <AtelierCard padding="md" className="bg-primary/5 border border-primary/10">
          <View className="flex-row items-center gap-3 mb-2">
            <Info size={18} color={Colors.primary.DEFAULT} />
            <AtelierTypography variant="h3" className="text-primary text-sm">Mẹo thông minh</AtelierTypography>
          </View>
          <AtelierTypography variant="body" className="text-neutral-600 text-xs">
             Ngân sách các danh mục bị giới hạn bởi Mục tiêu tổng hàng tháng. Điều này giúp bạn đảm bảo không phân bổ quá số tiền mình có.
          </AtelierTypography>
        </AtelierCard>
      </ScrollView>

      {/* --- MODALS --- */}

      {/* Target Spending Modal */}
      <Modal visible={isTargetModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setTargetModalVisible(false)} 
            className="flex-1" 
          />
          <MotiView 
            from={{ translateY: 400 }}
            animate={{ translateY: 0 }}
            className="bg-white rounded-t-[40px] p-8 pb-12"
          >
            <View className="flex-row justify-between items-center mb-8">
              <AtelierTypography variant="h2">Mục tiêu chi tiêu</AtelierTypography>
              <TouchableOpacity
                onPress={() => setTargetModalVisible(false)}
                className="w-12 h-12 items-center justify-center bg-neutral-50 rounded-2xl"
              >
                <X size={22} color={Colors.neutral[900]} />
              </TouchableOpacity>
            </View>
            
            <AtelierTypography variant="body" className="text-neutral-500 mb-6 px-1">Tùy chỉnh giới hạn chi tiêu tổng của bạn trong tháng này.</AtelierTypography>
            
            <View className="bg-neutral-50 rounded-[32px] p-8 mb-8 border border-neutral-100">
              <TextInput
                value={tempTarget}
                onChangeText={setTempTarget}
                placeholder="Ví dụ: 15,000,000"
                keyboardType="numeric"
                className="font-headline font-bold text-4xl text-primary text-center"
                autoFocus
                placeholderTextColor={Colors.neutral[200]}
              />
              <AtelierTypography variant="label" className="text-center text-neutral-400 mt-4 uppercase">SỐ TIỀN (VNĐ)</AtelierTypography>
            </View>

            <TouchableOpacity 
              onPress={handleSaveTarget}
              activeOpacity={0.8}
              className="bg-primary py-5 rounded-[24px] items-center shadow-xl shadow-primary/25"
            >
              <AtelierTypography variant="h3" color="white">Xác nhận mục tiêu</AtelierTypography>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      {/* Category Budget Modal */}
      <Modal visible={isCategoryModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => { setCategoryModalVisible(false); setSelectedCategory(null); }} 
            className="flex-1" 
          />
          <MotiView 
            from={{ translateY: 500 }}
            animate={{ translateY: 0 }}
            className="bg-white rounded-t-[40px] p-8 pb-12"
          >
            <View className="flex-row justify-between items-center mb-8">
              <AtelierTypography variant="h2">Phân bổ ngân sách</AtelierTypography>
              <TouchableOpacity
                onPress={() => { setCategoryModalVisible(false); setSelectedCategory(null); }}
                className="w-12 h-12 items-center justify-center bg-neutral-50 rounded-2xl"
              >
                <X size={22} color={Colors.neutral[900]} />
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
            {!selectedCategory && (
              <View className="mb-8">
                <AtelierTypography variant="label" className="text-neutral-400 uppercase mb-4 px-1">CHỌN DANH MỤC</AtelierTypography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
                  {categories?.map(cat => (
                    <TouchableOpacity 
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat.id ? "bg-primary border-primary" : "bg-white border-neutral-100"}`}
                    >
                      <AtelierTypography variant="h3" color={selectedCategory === cat.id ? "white" : "neutral"}>{cat.name}</AtelierTypography>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedCategory && (
              <View>
                <View className="flex-row justify-between items-center mb-4 px-1">
                   <AtelierTypography variant="h3">Hạn mức ngân sách</AtelierTypography>
                   <AtelierTypography variant="h2" className="text-primary">{formatCurrency(categoryAmount)}</AtelierTypography>
                </View>

                {/* SLIDER */}
                <View className="my-8">
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={remainingForSlider}
                    step={100000}
                    value={categoryAmount}
                    onValueChange={setCategoryAmount}
                    minimumTrackTintColor={Colors.primary.DEFAULT}
                    maximumTrackTintColor="#f0f0f5"
                    thumbTintColor={Colors.primary.DEFAULT}
                  />
                  <View className="flex-row justify-between px-2 mt-2">
                    <AtelierTypography variant="caption" className="text-neutral-400">0</AtelierTypography>
                    <AtelierTypography variant="caption" className="text-neutral-400">Tối đa: {formatCurrency(remainingForSlider)}</AtelierTypography>
                  </View>
                </View>

                {/* PRESETS */}
                <View className="flex-row gap-3 mb-10 px-1">
                   {[0.25, 0.5, 1].map(factor => {
                     const val = Math.floor(remainingForSlider * factor / 100000) * 100000;
                     return (
                       <TouchableOpacity 
                         key={factor}
                         onPress={() => setCategoryAmount(val)}
                         className="flex-1 bg-neutral-50 py-4 rounded-2xl items-center border border-neutral-100"
                       >
                         <AtelierTypography variant="label" className="text-primary uppercase">
                           {factor === 1 ? "Max" : `${factor * 100}%`}
                         </AtelierTypography>
                       </TouchableOpacity>
                     );
                   })}
                </View>

                <TouchableOpacity 
                  onPress={handleSaveCategoryBudget}
                  disabled={categoryAmount <= 0}
                  activeOpacity={0.8}
                  className={`py-5 rounded-[24px] items-center shadow-xl ${categoryAmount <= 0 ? "bg-neutral-100" : "bg-primary shadow-primary/25"}`}
                >
                  <AtelierTypography variant="h3" color={categoryAmount <= 0 ? "neutral" : "white"}>
                    Áp dụng ngân sách
                  </AtelierTypography>
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
