import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Wallet, ChevronDown, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../../store/useAppStore';
import { useWallets } from '../../hooks/useWallets';
import { useDashboard } from '../../hooks/useDashboard';
import { useComparison } from '../../hooks/useComparison';
import { useBudgets } from '../../hooks/useBudgets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/format';
import {
  AtelierTypography,
  AtelierInsightCard,
  BudgetAlertModal,
  AtelierCard,
  AtelierTransactionCard,
  SkeletonBox,
} from '../../components/ui';
import { WalletModal } from '../wallets/WalletModal';
import { WalletSelectionModal } from '../wallets/WalletSelectionModal';
import { poster } from '../../services/api';
import * as Haptics from 'expo-haptics';
import type { BudgetResponse } from '../../types/api';

const ALERT_DISMISSED_KEY = 'budget_alert_dismissed_';

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

  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any | null>(null);

  const { data: wallets, isLoading: isWalletsLoading, refetch: refetchWallets } = useWallets();

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useDashboard(activeWalletId || '');

  const { data: comparison, isLoading: isComparisonLoading } = useComparison(activeWalletId || '');

  const { data: budgets } = useBudgets();

  const isLoading = isWalletsLoading || isDashboardLoading;
  const activeWallet = wallets?.find((w) => w.id === activeWalletId);

  // Gamification: Check budgets for DANGER/OVERBUDGET and fire alert modal
  useEffect(() => {
    if (!budgets?.length) return;

    const checkAlerts = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const critical = budgets.find(
        (b) => b.thresholdStatus === 'OVERBUDGET' || b.thresholdStatus === 'DANGER',
      );

      if (!critical) return;

      const dismissKey = `${ALERT_DISMISSED_KEY}${critical.id}_${today}`;
      const wasDismissed = await AsyncStorage.getItem(dismissKey);
      if (wasDismissed) return;

      try {
        const result = await poster<{ insight: string }, any>('/ai/budget-insight', {
          category_name: critical.categoryName,
          threshold: critical.thresholdStatus,
        });
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
      const critical = budgets?.find((b) => b.categoryName === alertData.categoryName);
      if (critical) {
        await AsyncStorage.setItem(`${ALERT_DISMISSED_KEY}${critical.id}_${today}`, '1');
      }
    }
    setAlertVisible(false);
  };

  const onRefresh = React.useCallback(() => {
    refetchWallets();
    refetchDashboard();
  }, []);

  // Dashboard budget summary stats
  const totalBudgetLimit =
    budgets?.reduce((s: number, b: BudgetResponse) => s + b.limitAmount, 0) ?? 0;
  const totalBudgetSpent =
    budgets?.reduce((s: number, b: BudgetResponse) => s + b.currentSpending, 0) ?? 0;
  const budgetPct =
    totalBudgetLimit > 0 ? Math.min((totalBudgetSpent / totalBudgetLimit) * 100, 100) : 0;
  const hasBudgets = !!budgets?.length;

  const spendingBarColor =
    budgetPct >= 100
      ? 'bg-error'
      : budgetPct >= 80
        ? 'bg-[#f59e0b]'
        : budgetPct >= 50
          ? 'bg-primary-300'
          : 'bg-primary';

  return (
    <View className="flex-1 bg-surface-container-lowest">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingHorizontal: 24,
          paddingBottom: 180,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#1275e2" />
        }
      >
        {/* Greeting & Wallet Selection */}
        <View className="mb-8 flex-row justify-between items-start">
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
          >
            <AtelierTypography variant="label" className="text-neutral-400 mb-1">
              Chào mừng trở lại,
            </AtelierTypography>
            <AtelierTypography variant="h2" className="text-neutral-900">
              {user?.name || 'Atelier Finance'}
            </AtelierTypography>
          </MotiView>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectionModalVisible(true);
            }}
            className="bg-white px-4 py-2 rounded-full shadow-atelier-low border border-neutral-100 flex-row items-center gap-2"
            activeOpacity={0.7}
          >
            <Wallet size={16} color="#1275e2" />
            <AtelierTypography
              variant="label"
              className="text-neutral-900 normal-case lowercase-none"
            >
              {activeWallet?.name || 'Ví chính'}
            </AtelierTypography>
            <ChevronDown size={14} color="#74777f" />
          </TouchableOpacity>
        </View>

        {/* Balance Card Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          className="mb-8"
        >
          <LinearGradient
            colors={['#1275e2', '#0d5bb8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 rounded-[32px] min-h-[180px] shadow-xl shadow-primary/30"
          >
            <AtelierTypography variant="label" className="text-white/90 normal-case font-semibold">
              Tổng số dư
            </AtelierTypography>
            {isLoading ? (
              <SkeletonBox height={40} radius={8} className="mt-2 bg-white/20" />
            ) : (
              <View>
                <AtelierTypography variant="h1" className="text-white text-4xl mt-2">
                  {formatCurrency(dashboard?.summary?.balance)}
                </AtelierTypography>
                {dashboard?.summary?.netFlow !== undefined && (
                  <AtelierTypography variant="caption" className="text-white/90 mt-1">
                    Biến động tháng này:{' '}
                    <AtelierTypography
                      variant="caption"
                      className={
                        dashboard.summary.netFlow >= 0
                          ? 'text-green-200 font-semibold'
                          : 'text-red-200 font-semibold'
                      }
                    >
                      {dashboard.summary.netFlow >= 0 ? '+' : ''}
                      {formatCurrency(dashboard.summary.netFlow)}
                    </AtelierTypography>
                  </AtelierTypography>
                )}
              </View>
            )}

            <View className="flex-row items-center gap-4 mt-6">
              <View>
                <AtelierTypography variant="label" className="text-white/70 font-semibold">
                  THU NHẬP
                </AtelierTypography>
                <AtelierTypography variant="h3" className="text-white text-md font-bold">
                  {formatCurrency(dashboard?.summary?.income)}
                </AtelierTypography>
              </View>
              <View className="w-[1px] h-8 bg-white/20" />
              <View>
                <AtelierTypography variant="label" className="text-white/70 font-semibold">
                  CHI TIÊU
                </AtelierTypography>
                <AtelierTypography variant="h3" className="text-white text-md font-bold">
                  {formatCurrency(dashboard?.summary?.expenses)}
                </AtelierTypography>
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
            onPress={() => setSelectionModalVisible(true)}
          />
        )}

        {/* Main Budget Progress UI */}
        <AtelierCard elevation="lowest" className="mb-8 bg-white shadow-md">
          <View className="flex-row justify-between items-end mb-4">
            <View>
              <AtelierTypography variant="label" className="text-neutral-500 mb-1 font-semibold">
                Sức mua khả dụng
              </AtelierTypography>
              <AtelierTypography variant="h3" className="text-neutral-900 font-bold">
                {formatCurrency(dashboard?.summary?.expenses)}
                <AtelierTypography variant="body" className="text-neutral-500 text-sm">
                  {hasBudgets ? ` / ${formatCurrency(totalBudgetLimit)}` : ' / Chưa đặt hạn mức'}
                </AtelierTypography>
              </AtelierTypography>
            </View>
            {hasBudgets ? (
              <AtelierTypography
                variant="label"
                className={`text-xs font-bold ${budgetPct >= 80 ? 'text-error' : budgetPct >= 50 ? 'text-warning' : 'text-primary'}`}
              >
                Đã dùng {budgetPct.toFixed(0)}%
              </AtelierTypography>
            ) : (
              <AtelierTypography variant="label" className="text-xs text-primary font-bold">
                Tỷ lệ tiết kiệm {dashboard?.summary?.savingsRate?.toFixed(0)}%
              </AtelierTypography>
            )}
          </View>
          <View className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: hasBudgets ? `${budgetPct}%` : '0%' }}
              transition={{ type: 'timing', duration: 1500, delay: 800 }}
              className={`h-full rounded-full ${hasBudgets ? spendingBarColor : 'bg-primary'}`}
            />
          </View>
        </AtelierCard>

        {/* Recent Activity Feed */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <AtelierTypography variant="h3">Giao dịch gần đây</AtelierTypography>
            <TouchableOpacity>
              <AtelierTypography variant="label" className="text-primary text-sm normal-case">
                Tất cả
              </AtelierTypography>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <SkeletonBox key={i} height={80} radius={20} className="mb-3" />
                ))
              : dashboard?.transactions?.map((item: any, idx: number) => (
                  <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', delay: 100 * idx }}
                  >
                    <AtelierCard elevation="lowest" padding="sm" className="bg-white shadow-sm">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center gap-4 mr-3">
                          <View className="w-12 h-12 rounded-2xl bg-surface-container-low items-center justify-center">
                            {item.type === 'INCOME' ? (
                              <TrendingUp size={20} color="#22c55e" />
                            ) : (
                              <Wallet size={20} color="#1275e2" />
                            )}
                          </View>
                          <View className="flex-1">
                            <AtelierTypography
                              variant="h3"
                              className="text-[15px] text-neutral-900 font-semibold"
                              numberOfLines={1}
                            >
                              {item.categoryName || 'Chung'}
                            </AtelierTypography>
                            <AtelierTypography
                              variant="caption"
                              className="text-neutral-500"
                              numberOfLines={1}
                            >
                              {item.description || 'Không có mô tả'}
                            </AtelierTypography>
                          </View>
                        </View>
                        <View className="items-end">
                          <AtelierTypography
                            variant="h3"
                            className={`text-[15px] font-bold ${item.type === 'INCOME' ? 'text-green-600' : 'text-error'}`}
                          >
                            {item.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(item.amount)}
                          </AtelierTypography>
                        </View>
                      </View>
                    </AtelierCard>
                  </MotiView>
                ))}
          </View>
        </View>
      </ScrollView>

      {/* Modals and Overlays */}
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

      <WalletModal
        isVisible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        walletToEdit={editingWallet}
      />

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
    </View>
  );
}
