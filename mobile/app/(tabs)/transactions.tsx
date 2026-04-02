import React, { useCallback, useMemo } from "react";
import { View, SectionList, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Search, Calendar, Utensils, ShoppingBag, Wallet, Car, Home } from "lucide-react-native";
import { AtelierTypography, AtelierCard } from "../../components/ui";
import { useTransactions } from "../../hooks/useTransactions";
import { useWallets } from "../../hooks/useWallets";
import { useAppStore } from "../../store/useAppStore";
import type { Transaction } from "../../types";

const FilterButton = ({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className={`flex-row items-center px-5 py-2.5 rounded-full mr-3 border ${
      active
        ? "bg-primary border-primary shadow-sm"
        : "bg-surface-container border-outline-variant/10"
    }`}
  >
    <Icon size={16} color={active ? "white" : "#414753"} />
    <AtelierTypography 
      variant="label" 
      className={`ml-2 normal-case ${active ? "text-white" : "text-surface-on"}`}
    >
      {label}
    </AtelierTypography>
  </TouchableOpacity>
);

const TransactionItem = React.memo(({ item, currencyCode = "VND", locale = "vi-VN" }: { item: Transaction, currencyCode?: string, locale?: string }) => {
  const isIncome = item.type === "INCOME";
  const Icon = useMemo(() => {
    switch (item.category.toLowerCase()) {
      case "dining": case "food": return Utensils;
      case "shopping": return ShoppingBag;
      case "salary": case "income": return Wallet;
      case "transport": case "car": return Car;
      case "housing": case "rent": return Home;
      default: return Wallet;
    }
  }, [item.category]);

  const bgColor = useMemo(() => {
    switch (item.category.toLowerCase()) {
      case "dining": case "food": return "bg-secondary-container/10";
      case "income": case "salary": return "bg-primary-container/10";
      case "housing": return "bg-tertiary-container/10";
      default: return "bg-surface-container";
    }
  }, [item.category]);

  const iconColor = useMemo(() => {
    switch (item.category.toLowerCase()) {
      case "dining": case "food": return "#465f89";
      case "income": case "salary": return "#005ab4";
      case "housing": return "#964400";
      default: return "#414753";
    }
  }, [item.category]);

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <View className="bg-surface-container-lowest p-4 rounded-2xl flex-row items-center justify-between shadow-sm mb-3 mx-6">
        <View className="flex-row items-center flex-1 mr-4">
          <View className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mr-4`}>
            <Icon size={24} color={iconColor} />
          </View>
          <View className="flex-1">
            <AtelierTypography variant="h3" className="text-sm font-semibold" numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </AtelierTypography>
            <AtelierTypography variant="caption" className="text-xs text-surface-on-variant">
              {item.category} • {new Date(item.transactionDate).toLocaleDateString()}
            </AtelierTypography>
          </View>
        </View>
        <View className="items-end min-w-[100px]">
          <AtelierTypography
            variant="h3"
            className={`text-lg ${isIncome ? "text-secondary" : "text-error"}`}
          >
            {isIncome ? "+" : "-"}
            {new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(item.amount)}
          </AtelierTypography>
        </View>
      </View>
    </MotiView>
  );
});

TransactionItem.displayName = "TransactionItem";

export default function TransactionsScreen() {
  const { activeWalletId } = useAppStore();
  const { data: wallets } = useWallets();
  const { transactions, isLoading, refetch } = useTransactions(activeWalletId);
  
  const activeWallet = wallets?.find(w => w.id === activeWalletId);
  const currencyCode = activeWallet?.currencyCode || "VND";
  const locale = currencyCode === "VND" ? "vi-VN" : "en-US";

  const sections = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    if (!transactions) return [];
    
    transactions.forEach((tx: Transaction) => {
      const dateKey = new Date(tx.transactionDate).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return Object.entries(groups).map(([date, data]) => ({
      title: date,
      data,
    })).sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());
  }, [transactions]);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => <TransactionItem item={item} currencyCode={currencyCode} locale={locale} />,
    [currencyCode, locale]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <View className="px-6 py-4 bg-surface/90">
        <AtelierTypography variant="label" className="text-outline text-[10px] tracking-widest font-bold">
          {title.toUpperCase()}
        </AtelierTypography>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch} 
            tintColor="#005ab4" 
          />
        }
        ListHeaderComponent={
          <View className="mb-4">
            {/* Header */}
            <View className="px-6 pt-8 mb-8 flex-row justify-between items-center">
              <AtelierTypography variant="h2" className="text-surface-on">
                Transactions
              </AtelierTypography>
              {isLoading && <ActivityIndicator size="small" color="#005ab4" />}
            </View>

            {/* Search Bar */}
            <View className="px-6 mb-8">
              <View className="relative">
                <View className="absolute inset-y-0 left-4 z-10 justify-center">
                  <Search size={20} color="#717785" />
                </View>
                <TextInput
                  placeholder="Search your transactions..."
                  placeholderTextColor="rgba(113, 119, 133, 0.6)"
                  className="bg-surface-container-lowest rounded-2xl py-4 pl-12 pr-4 text-surface-on shadow-sm font-inter"
                />
              </View>
            </View>

            {/* Filters */}
            <View className="px-6 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <AtelierTypography variant="h3" className="text-lg">Activity Filters</AtelierTypography>
                <TouchableOpacity><AtelierTypography variant="label" className="text-primary low-case">Clear All</AtelierTypography></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                <FilterButton icon={Calendar} label="Last 30 Days" active />
                <FilterButton icon={Utensils} label="Dining" />
                <FilterButton icon={ShoppingBag} label="Lifestyle" />
                <FilterButton icon={Wallet} label="Salary" />
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-6 mt-8">
            <AtelierCard elevation="lowest" padding="lg">
              <View className="items-center py-12">
                <AtelierTypography variant="body" className="text-surface-on-variant mb-2">
                  {isLoading ? "Loading transactions..." : "No transactions yet"}
                </AtelierTypography>
                <AtelierTypography variant="caption" className="text-xs text-center text-outline px-8">
                  {isLoading ? "Please wait while we fetch your data." : "Your transaction history will appear here. Try adding one from the Home screen."}
                </AtelierTypography>
              </View>
            </AtelierCard>
          </View>
        }
      />
    </SafeAreaView>
  );
}
