import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { TrendingUp, Sparkles, Coffee, Home, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AtelierTypography,
  AtelierCard,
} from "../../components/ui";
import { AbstractWave } from "../../components/ui/AbstractWave";
import { useWallets } from "../../hooks/useWallets";
import { useDashboard } from "../../hooks/useDashboard";
import { useAppStore } from "../../store/useAppStore";
import { DashboardSkeleton } from "../../components/ui/Skeleton";
import { TransactionDetailModal } from "../../components/TransactionDetailModal";
import { WalletSelector } from "../../components/WalletSelector";
import { Transaction } from "../../hooks/useDashboard";
import { Pressable } from "react-native";

export default function HomeScreen() {
  const { activeWalletId, setActiveWalletId } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Fetch danh sách ví để lấy ID mặc định
  const { data: wallets, refetch: refetchWallets } = useWallets();
  
  // Fetch dữ liệu tổng quát cho Dashboard
  const { 
    data: dashboardData, 
    isLoading, 
    refetch: refetchDashboard 
  } = useDashboard(activeWalletId);

  // Tự động chọn ví đầu tiên nếu chưa có
  useEffect(() => {
    if (wallets && wallets.length > 0 && !activeWalletId) {
      setActiveWalletId(wallets[0].id);
    }
  }, [wallets, activeWalletId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDashboard(), refetchWallets()]);
    setRefreshing(false);
  }, [refetchDashboard, refetchWallets]);

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  const { summary, transactions = [] } = dashboardData || {};
  const activeWallet = wallets?.find(w => w.id === activeWalletId);
  const currencyCode = activeWallet?.currencyCode || "VND";
  const locale = currencyCode === "VND" ? "vi-VN" : "en-US";

  return (
    <SafeAreaView className="flex-1 bg-surface" aria-label="Financial Dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005ab4" />
        }
      >
        {/* Greeting Section - Motion check: prefers-reduced-motion handled by Moti */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          className="mb-8"
          aria-label="Welcome section"
        >
          <AtelierTypography variant="label" className="text-surface-on-variant mb-1">
            Financial Atelier
          </AtelierTypography>
          <AtelierTypography variant="h2" className="text-surface-on">
            Your Dashboard.
          </AtelierTypography>
        </MotiView>

        {/* Balance Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
          className="mb-8"
        >
          <AtelierCard elevation="high" padding="none" className="h-[220px]">
            <LinearGradient
              colors={["#005ab4", "#0873df"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-8 justify-between relative overflow-hidden"
            >
              <View className="z-10">
                <AtelierTypography variant="caption" color="rgba(255,255,255,0.8)" className="font-medium">
                  Total Balance
                </AtelierTypography>
                <AtelierTypography variant="h1" color="#ffffff" className="mt-2 text-4xl">
                  {new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: currencyCode === "VND" ? 0 : 2 }).format(summary?.balance || 0)}
                </AtelierTypography>
                <View className="flex-row items-center gap-4 mt-6">
                  <View className="flex-row items-center gap-1">
                    <ArrowDownLeft size={14} color="#4ade80" />
                    <AtelierTypography variant="label" color="#ffffff" className="text-[10px]">
                      +{new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(summary?.income || 0)}
                    </AtelierTypography>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <ArrowUpRight size={14} color="#f87171" />
                    <AtelierTypography variant="label" color="#ffffff" className="text-[10px]">
                      -{new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(summary?.expenses || 0)}
                    </AtelierTypography>
                  </View>
                </View>
              </View>
              
              <AbstractWave 
                color="white" 
                style={{ position: "absolute", bottom: -20, left: 0, right: 0, height: 120 }} 
              />
            </LinearGradient>
          </AtelierCard>
        </MotiView>

        {/* Wallet Selector */}
        {wallets && wallets.length > 0 && (
          <WalletSelector 
            wallets={wallets} 
            activeWalletId={activeWalletId} 
            onSelect={setActiveWalletId}
            style={{ marginBottom: 32 }}
          />
        )}

        {/* AI Insight Card */}
        {summary && summary.savingsRate < 0.2 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
            className="mb-8"
          >
            <AtelierCard variant="tertiary" padding="md">
              <View className="flex-row items-center gap-2 mb-2">
                <Sparkles size={18} color="#bd5700" fill="#bd5700" />
                <AtelierTypography variant="h3" className="text-tertiary text-sm">
                  Atelier Insight
                </AtelierTypography>
              </View>
              <AtelierTypography variant="body" className="text-surface-on text-sm">
                Chi tiêu tháng này đang chiếm cao trong thu nhập. Hãy cân nhắc cắt giảm các khoản không thiết yếu.
              </AtelierTypography>
            </AtelierCard>
          </MotiView>
        )}

        {/* Recent Activity */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <AtelierTypography variant="h3" className="text-surface-on">Recent Activity</AtelierTypography>
            <AtelierTypography variant="label" className="text-primary">View All</AtelierTypography>
          </View>
          
          <View className="gap-3">
            {transactions.length === 0 ? (
              <AtelierCard padding="md" variant="outline">
                <AtelierTypography variant="caption" className="text-center py-4">
                  Chưa có giao dịch nào gần đây.
                </AtelierTypography>
              </AtelierCard>
            ) : (
              transactions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleTransactionPress(item)}
                >
                  <View
                    className="flex-row items-center justify-between p-4 bg-surface-container-lowest rounded-2xl shadow-sm"
                  >
                    <View className="flex-row items-center flex-1 mr-4">
                      <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center mr-4">
                        {item.type === "INCOME" ? (
                          <WalletIcon size={24} color="#005ab4" />
                        ) : (
                          <Coffee size={24} color="#414753" />
                        )}
                      </View>
                      <View className="flex-1">
                        <AtelierTypography variant="h3" className="text-sm" numberOfLines={1} ellipsizeMode="tail">
                          {item.description}
                        </AtelierTypography>
                        <AtelierTypography variant="caption" className="text-xs">
                          {item.type} • {new Date(item.transactionDate).toLocaleDateString()}
                        </AtelierTypography>
                      </View>
                    </View>
                    <View className="items-end min-w-[100px]">
                      <AtelierTypography 
                        variant="h3" 
                        className={`text-sm ${item.type === "EXPENSE" ? "text-error" : "text-secondary"}`}
                      >
                        {item.type === "EXPENSE" ? "-" : "+"}
                        {new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(item.amount)}
                      </AtelierTypography>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </MotiView>
      </ScrollView>

      {/* Detail Modal */}
      <TransactionDetailModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}

