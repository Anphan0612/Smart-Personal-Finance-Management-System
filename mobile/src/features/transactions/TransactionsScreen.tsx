import React, { useState, useMemo } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { MotiView } from "moti";
import {
  Search,
  TrendingUp,
  Wallet,
  Calendar,
  ChevronRight,
  Filter,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionResponse } from "@/types/api";
import { Skeleton } from "@/components/common/Skeleton";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { formatCurrency } from "@/utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TransactionDetailSheet from "./components/TransactionDetailSheet";

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { activeWalletId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  
  const {
    data,
    isLoading,
    refetch
  } = useTransactions(activeWalletId || "");

  const isFetchingNextPage = false;
  const hasNextPage = false;
  const fetchNextPage = () => {};

  // Extract content from PagedResponse
  const transactions = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return (data as any).content ?? [];
  }, [data]);

  const handleTransactionPress = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setIsSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setIsSheetVisible(false);
    // Optional: Only clear selected after animation
    // setSelectedTransaction(null);
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Filter by search query if any
    const filtered = transactions.filter((t: TransactionResponse) =>
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [key: string]: TransactionResponse[] } = {};
    filtered.forEach((t: TransactionResponse) => {
      const date = t.transactionDate.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });

    // Sort dates descending and convert to array format for FlatList
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        items: groups[date]
      }));
  }, [transactions, searchQuery]);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#005ab4" />
      </View>
    );
  };

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mb-8"
    >
      <Text className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-2">
        Activity.
      </Text>
      <View className="relative flex-row items-center bg-white rounded-2xl px-5 py-4 shadow-sm border border-outline/5">
        <Search size={20} color="#717785" />
        <TextInput
          placeholder="Search your transactions..."
          className="flex-1 ml-3 text-[15px] font-medium text-on-surface"
          placeholderTextColor="rgba(113, 119, 133, 0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </MotiView>
  );

  const renderItem = ({ item, index }: { item: { date: string; items: TransactionResponse[] }; index: number }) => (
    <MotiView
      key={item.date}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100 }}
      className="mb-8"
    >
      <Text className="font-headline font-bold text-[10px] uppercase tracking-widest text-outline mb-4 px-1">
        {formatDateLabel(item.date)}
      </Text>
      <View className="gap-3">
        {item.items.map((transaction: TransactionResponse) => (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            onPress={() => handleTransactionPress(transaction)}
            className="bg-white p-4 rounded-[20px] flex-row items-center justify-between shadow-sm border border-outline/5"
          >
            <View className="flex-1 flex-row items-center gap-4 mr-3">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${
                transaction.type === 'INCOME' ? 'bg-secondary/10' : 'bg-error/10'
              }`}>
                {transaction.type === 'INCOME' ?
                  <ArrowDownLeft size={20} color="#00C853" /> :
                  <ArrowUpRight size={20} color="#FF5252" />
                }
              </View>
              <View className="flex-1">
                <Text className="font-bold text-on-surface text-[15px]" numberOfLines={1} ellipsizeMode="tail">
                  {transaction.description || transaction.categoryName}
                </Text>
                <Text className="text-[10px] text-outline font-bold uppercase tracking-wider">
                  {transaction.categoryName || 'General'}
                </Text>
              </View>
            </View>
            <View className="items-end" style={{ flexShrink: 0, minWidth: 90 }}>
              <Text className={`font-headline font-bold text-[16px] ${
                transaction.type === 'INCOME' ? 'text-secondary' : 'text-error'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
              <Text className="text-[9px] text-outline font-medium">
                {format(parseISO(transaction.transactionDate), "HH:mm")}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </MotiView>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          {[1, 2, 3, 4].map(i => (
            <View key={i} className="mb-8">
              <Skeleton width={120} height={16} radius={4} style={{ marginBottom: 12 }} />
              <View className="gap-3">
                <Skeleton width="100%" height={80} radius={20} />
                <Skeleton width="100%" height={80} radius={20} />
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-outline font-bold">No transactions found</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={groupedTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 24, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#005ab4" />
        }
      />

      <TransactionDetailSheet
        transaction={selectedTransaction}
        isVisible={isSheetVisible}
        onClose={handleCloseSheet}
      />
    </View>
  );
}
