import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { 
  TrendingUp, 
  Sparkles, 
  Coffee, 
  Wallet, 
  ChevronDown,
  Plus
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "../../store/useAppStore";
import { useWallets } from "../../hooks/useWallets";
import { useDashboard } from "../../hooks/useDashboard";
import { useComparison } from "../../hooks/useComparison";
import { useBudgets } from "../../hooks/useBudgets";
import { Skeleton } from "../../components/common/Skeleton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCurrency } from "../../utils/format";
import { AtelierInsightCard } from "../../components/ui/AtelierInsightCard";
import { BudgetAlertModal } from "../../components/ui/BudgetAlertModal";
import { ManualTransactionModal } from "../transactions/ManualTransactionModal";
import { WalletModal } from "../wallets/WalletModal";
import { WalletSelectionModal } from "../wallets/WalletSelectionModal";
import { poster } from "../../services/api";
import * as Haptics from "expo-haptics";
import type { BudgetResponse, ThresholdStatus } from "../../types/api";

const ALERT_DISMISSED_KEY = "budget_alert_dismissed_";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { activeWalletId, setActiveWalletId, user } = useAppStore();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<{
    categoryName: string;
    percentageUsed: number;
    overspentAmount: number;
    aiInsight: string;
  } | null>(null);
  
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any | null>(null);
  
  const { 
    data: wallets, 
    isLoading: isWalletsLoading,
    refetch: refetchWallets 
  } = useWallets();

  const { 
    data: dashboard, 
    isLoading: isDashboardLoading,
    refetch: refetchDashboard 
  } = useDashboard(activeWalletId || "");

  const { 
    data: comparison, 
    isLoading: isComparisonLoading 
  } = useComparison(activeWalletId || "");

  const { data: budgets } = useBudgets();

  const isLoading = isWalletsLoading || isDashboardLoading;
  const activeWallet = wallets?.find(w => w.id === activeWalletId);

  // Gamification: Check budgets for DANGER/OVERBUDGET and fire alert modal
  useEffect(() => {
    if (!budgets?.length) return;

    const checkAlerts = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const critical = budgets.find(
        b => b.thresholdStatus === "OVERBUDGET" || b.thresholdStatus === "DANGER"
      );

      if (!critical) return;

      const dismissKey = `${ALERT_DISMISSED_KEY}${critical.id}_${today}`;
      const wasDismissed = await AsyncStorage.getItem(dismissKey);
      if (wasDismissed) return;

      try {
        const result = await poster<{ insight: string }, any>(
          "/ai/budget-insight",
          { category_name: critical.categoryName, threshold: critical.thresholdStatus }
        );
        setAlertData({
          categoryName: critical.categoryName,
          percentageUsed: critical.percentageUsed,
          overspentAmount: Math.abs(critical.remainingAmount),
          aiInsight: result.insight,
        });
        setAlertVisible(true);
      } catch {
        setAlertData({
          categoryName: critical.categoryName,
          percentageUsed: critical.percentageUsed,
          overspentAmount: Math.abs(critical.remainingAmount),
          aiInsight: `Quỹ ${critical.categoryName} đang ở mức ${critical.percentageUsed.toFixed(0)}%. Hãy cẩn thận!`,
        });
        setAlertVisible(true);
      }
    };

    checkAlerts();
  }, [budgets]);

  const handleDismissAlert = async () => {
    if (alertData) {
      const today = new Date().toISOString().slice(0, 10);
      const critical = budgets?.find(
        b => b.categoryName === alertData.categoryName
      );
      if (critical) {
        await AsyncStorage.setItem(`${ALERT_DISMISSED_KEY}${critical.id}_${today}`, "1");
      }
    }
    setAlertVisible(false);
  };

  const onRefresh = React.useCallback(() => {
    refetchWallets();
    refetchDashboard();
  }, []);

  // Dashboard budget summary stats
  const totalBudgetLimit = budgets?.reduce((s: number, b: BudgetResponse) => s + b.limitAmount, 0) ?? 0;
  const totalBudgetSpent = budgets?.reduce((s: number, b: BudgetResponse) => s + b.currentSpending, 0) ?? 0;
  const budgetPct = totalBudgetLimit > 0 ? Math.min((totalBudgetSpent / totalBudgetLimit) * 100, 100) : 0;
  const hasBudgets = !!budgets?.length;

  const spendingBarColor = budgetPct >= 100
    ? "bg-error"
    : budgetPct >= 80
    ? "bg-[#f97316]"
    : budgetPct >= 50
    ? "bg-[#f59e0b]"
    : "bg-primary";

  return (
    <ScrollView 
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#005ab4" />
      }
    >
      {/* Gamification Alert Modal */}
      {alertData && (
        <BudgetAlertModal
          visible={alertVisible}
          onDismiss={handleDismissAlert}
          categoryName={alertData.categoryName}
          percentageUsed={alertData.percentageUsed}
          overspentAmount={alertData.overspentAmount}
          aiInsight={alertData.aiInsight}
        />
      )}

      {/* Greeting & Wallet Selection */}
      <View className="mb-8 flex-row justify-between items-start">
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800 }}
        >
          <Text className="font-headline text-on-surface-variant text-sm font-bold tracking-widest uppercase mb-1">
            Welcome back,
          </Text>
          <Text className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">
            {user?.name || "Atelier Finance"}
          </Text>
        </MotiView>

        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectionModalVisible(true);
          }}
          className="bg-white px-4 py-2 rounded-full shadow-sm border border-outline/10 flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <Wallet size={16} color="#005ab4" />
          <Text className="font-bold text-sm text-on-surface">
            {activeWallet?.name || "Main Wallet"}
          </Text>
          <ChevronDown size={14} color="#717785" />
        </TouchableOpacity>
      </View>

      {/* Balance Card Section */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", delay: 200 }}
        className="mb-8"
      >
        <LinearGradient
          colors={["#005ab4", "#0873df"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-8 rounded-[32px] min-h-[180px] shadow-xl"
          style={{ shadowColor: "#005ab4", shadowOpacity: 0.3, shadowRadius: 20 }}
        >
          <Text className="text-white/80 font-medium text-sm">Total Balance</Text>
          {isLoading ? (
            <Skeleton width={200} height={40} radius={8} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          ) : (
            <View>
              <Text className="text-white font-headline font-extrabold text-4xl mt-2 tracking-tighter">
                {formatCurrency(dashboard?.summary?.balance)}
              </Text>
              {dashboard?.summary?.netFlow !== undefined && (
                <Text className="text-white/80 font-medium text-sm mt-1">
                  Net Flow this month: <Text className={dashboard.summary.netFlow >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}>
                    {dashboard.summary.netFlow >= 0 ? '+' : ''}{formatCurrency(dashboard.summary.netFlow)}
                  </Text>
                </Text>
              )}
            </View>
          )}
          
          <View className="flex-row items-center gap-4 mt-6">
            <View>
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Income</Text>
              <Text className="text-white font-bold text-md">{formatCurrency(dashboard?.summary?.income)}</Text>
            </View>
            <View className="w-[1px] h-8 bg-white/10" />
            <View>
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Expense</Text>
              <Text className="text-white font-bold text-md">{formatCurrency(dashboard?.summary?.expenses)}</Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>

      {/* AI Insights Card */}
      {!isLoading && comparison && (
        <AtelierInsightCard 
          type="weekly"
          current={comparison.currentWeek.totalExpense}
          previous={comparison.lastWeek.totalExpense}
          onPress={() => {/* Navigation for AI modal handled by parent FAB or store */}}
        />
      )}

      {/* Main Budget Progress UI (LIVE) */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", delay: 500 }}
        className="bg-white p-6 rounded-[24px] shadow-sm mb-8 border border-outline/5"
      >
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              Spending Power
            </Text>
            <Text className="font-headline font-bold text-lg text-on-surface">
              {formatCurrency(dashboard?.summary?.expenses)}
              <Text className="text-on-surface-variant font-normal text-sm">
                {hasBudgets ? ` / ${formatCurrency(totalBudgetLimit)}` : " / Limit unset"}
              </Text>
            </Text>
          </View>
          {hasBudgets ? (
            <Text 
              className="text-xs font-bold"
              style={{ color: budgetPct >= 80 ? "#ef4444" : budgetPct >= 50 ? "#f59e0b" : "#005ab4" }}
            >
              {budgetPct.toFixed(0)}% used
            </Text>
          ) : (
            <Text className="text-xs font-bold text-primary">
              {dashboard?.summary?.savingsRate?.toFixed(0)}% saved
            </Text>
          )}
        </View>
        <View className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
          <MotiView
            from={{ width: "0%" }}
            animate={{ width: hasBudgets ? `${budgetPct}%` : "42%" }}
            transition={{ type: "timing", duration: 1500, delay: 800 }}
            className={`h-full rounded-full ${hasBudgets ? spendingBarColor : "bg-primary"}`}
          />
        </View>
      </MotiView>

      {/* Recent Activity Feed */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="font-headline font-bold text-lg text-on-surface">Latest Flows</Text>
          <TouchableOpacity>
            <Text className="text-primary font-bold text-sm">View Feed</Text>
          </TouchableOpacity>
        </View>
        
        <View className="gap-3">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} width="100%" height={80} radius={20} />)
          ) : (
            dashboard?.transactions?.map((item: any, idx: number) => (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", delay: 100 * idx }}
                className="flex-row items-center justify-between p-4 bg-white rounded-[20px] shadow-sm border border-outline/5"
              >
                <View className="flex-1 flex-row items-center gap-4 mr-3">
                  <View className="w-12 h-12 rounded-full bg-surface-container-low items-center justify-center">
                    {item.type === 'INCOME' ? <TrendingUp size={20} color="#00C853" /> : <Wallet size={20} color="#414753" />}
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-on-surface text-[15px]" numberOfLines={1} ellipsizeMode="tail">
                      {item.categoryName || 'General'}
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wide" numberOfLines={1}>
                      {item.description || 'No description'}
                    </Text>
                  </View>
                </View>
                <View className="items-end" style={{ flexShrink: 0, minWidth: 80 }}>
                  <Text className={`font-headline font-bold text-[15px] ${item.type === 'INCOME' ? 'text-secondary' : 'text-error'}`}>
                    {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                  </Text>
                </View>
              </MotiView>
            ))
          )}
        </View>
      </View>

      {/* Manual Entry Modal */}
      <ManualTransactionModal 
        isVisible={manualEntryVisible} 
        onClose={() => setManualEntryVisible(false)} 
      />

      {/* Wallet Management Modal */}
      <WalletModal
        isVisible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        walletToEdit={editingWallet}
      />

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isVisible={selectionModalVisible}
        onClose={() => setSelectionModalVisible(false)}
        wallets={wallets || []}
        activeId={activeWalletId}
        onSelect={(id) => setActiveWalletId(id)}
        onAdd={() => {
          setEditingWallet(null);
          setWalletModalVisible(true);
        }}
        onEdit={(wallet) => {
          setEditingWallet(wallet);
          setWalletModalVisible(true);
        }}
      />

      {/* Floating Action Button (FAB) */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 1000 }}
        style={{
          position: "absolute",
          bottom: 30,
          right: 24,
          shadowColor: "#005ab4",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setManualEntryVisible(true);
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#005ab4", "#0873df"]}
            className="w-16 h-16 rounded-full items-center justify-center border-2 border-white/20"
          >
            <Plus size={32} color="white" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </ScrollView>
  );
}
