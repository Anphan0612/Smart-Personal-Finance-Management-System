import React, { useState, useMemo } from "react";
import { View, FlatList, TextInput, TouchableOpacity, RefreshControl } from "react-native";
import { MotiView } from "moti";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react-native";
import { useAppStore } from "@/store/useAppStore";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionResponse } from "@/types/api";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { formatCurrency } from "@/utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TransactionDetailSheet from "./components/TransactionDetailSheet";
import { 
  AtelierTypography, 
  AtelierCard, 
  SkeletonBox,
  AtelierTransactionCard 
} from "@/components/ui";
import { Colors } from "@/constants/tokens";

const TransactionSkeleton = () => (
  <AtelierCard elevation="lowest" padding="sm" className="mb-3 border border-neutral-100">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4 flex-1">
        <SkeletonBox width={48} height={48} radius={16} />
        <View className="flex-1 gap-2">
          <SkeletonBox width="70%" height={16} radius={4} />
          <SkeletonBox width="40%" height={12} radius={4} />
        </View>
      </View>
      <View className="items-end gap-2">
        <SkeletonBox width={80} height={20} radius={4} />
        <SkeletonBox width={40} height={10} radius={4} />
      </View>
    </View>
  </AtelierCard>
);

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { activeWalletId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useTransactions(activeWalletId || "");

  // Flatten and Filter Duplicates
  const allTransactions = useMemo(() => {
    if (!data?.pages) return [];
    
    const rawItems = data.pages.flatMap(page => page.content || []);
    const uniqueItemsMap = new Map<string, TransactionResponse>();
    
    rawItems.forEach(item => {
      if (item && item.id) {
        uniqueItemsMap.set(item.id, item);
      }
    });

    return Array.from(uniqueItemsMap.values());
  }, [data]);

  const handleTransactionPress = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setIsSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setIsSheetVisible(false);
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) return [];

    const filtered = allTransactions.filter((t: TransactionResponse) =>
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [key: string]: TransactionResponse[] } = {};
    filtered.forEach((t: TransactionResponse) => {
      const date = t.transactionDate.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        items: groups[date]
      }));
  }, [allTransactions, searchQuery]);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hôm nay";
    if (isYesterday(date)) return "Hôm qua";
    return format(date, "MMMM dd, yyyy");
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View className="h-20" />; 
    return (
      <View className="py-4 gap-3">
        {[1, 2, 3].map(i => <TransactionSkeleton key={`footer-skele-${i}`} />)}
      </View>
    );
  };

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mb-8"
    >
      <AtelierTypography variant="h1" className="text-neutral-900 mb-4">
        Hoạt động.
      </AtelierTypography>
      <View className="relative flex-row items-center bg-white rounded-[24px] px-5 py-4 shadow-atelier-low border border-neutral-100">
        <Search size={20} color={Colors.neutral[400]} />
        <TextInput
          placeholder="Tìm kiếm giao dịch..."
          className="flex-1 ml-3 text-sm font-body text-neutral-900"
          placeholderTextColor={Colors.neutral[400]}
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
      transition={{ delay: index * 50 }}
      className="mb-8"
    >
      <AtelierTypography variant="label" className="text-neutral-400 mb-4 px-1">
        {formatDateLabel(item.date)}
      </AtelierTypography>
      <View className="gap-3">
        {item.items.map((transaction: TransactionResponse) => (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            onPress={() => handleTransactionPress(transaction)}
          >
            <AtelierCard elevation="lowest" padding="sm" className="bg-white border border-neutral-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-4 mr-3">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    transaction.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {transaction.type === 'INCOME' ?
                      <ArrowDownLeft size={20} color={Colors.secondary.DEFAULT} /> :
                      <ArrowUpRight size={20} color={Colors.error} />
                    }
                  </View>
                  <View className="flex-1">
                    <AtelierTypography variant="h3" className="text-[15px]" numberOfLines={1}>
                      {transaction.description || transaction.categoryName}
                    </AtelierTypography>
                    <AtelierTypography variant="label" className="text-neutral-400 text-[10px]">
                      {transaction.categoryName || 'Chung'}
                    </AtelierTypography>
                  </View>
                </View>
                <View className="items-end">
                  <AtelierTypography variant="h3" className={`text-[16px] ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-error'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </AtelierTypography>
                  <AtelierTypography variant="caption" className="text-neutral-400">
                    {format(parseISO(transaction.transactionDate), "HH:mm")}
                  </AtelierTypography>
                </View>
              </View>
            </AtelierCard>
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
            <View key={`loading-skele-${i}`} className="mb-8">
              <View className="mb-3">
                <SkeletonBox width={120} height={16} radius={4} />
              </View>
              <View className="gap-3">
                <TransactionSkeleton />
                <TransactionSkeleton />
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20">
        <AtelierTypography variant="h3" className="text-neutral-400">Không tìm thấy giao dịch</AtelierTypography>
        <AtelierTypography variant="body" className="text-neutral-400/60 mt-1">Hãy thử trò chuyện với AI để thêm mới!</AtelierTypography>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface-lowest">
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
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            tintColor={Colors.primary.DEFAULT}
            colors={[Colors.primary.DEFAULT]} 
          />
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
