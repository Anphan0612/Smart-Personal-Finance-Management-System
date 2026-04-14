import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl } from "react-native";
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
    data: transactions, 
    isLoading, 
    refetch 
  } = useTransactions(activeWalletId || "");

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
    if (!transactions) return {};
    
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

    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .reduce((obj: any, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});
  }, [transactions, searchQuery]);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 24, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#005ab4" />
        }
      >
        {/* Header Section */}
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

        {/* Transactions Feed */}
        <View className="space-y-10">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <View key={i} className="mb-8">
                <Skeleton width={120} height={16} radius={4} style={{ marginBottom: 12 }} />
                <View className="gap-3">
                  <Skeleton width="100%" height={80} radius={20} />
                  <Skeleton width="100%" height={80} radius={20} />
                </View>
              </View>
            ))
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-outline font-bold">No transactions found</Text>
            </View>
          ) : (
            Object.entries(groupedTransactions).map(([date, items]: any, groupIdx) => (
              <MotiView
                key={date}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: groupIdx * 100 }}
                className="mb-8"
              >
                <Text className="font-headline font-bold text-[10px] uppercase tracking-widest text-outline mb-4 px-1">
                  {formatDateLabel(date)}
                </Text>
                <View className="gap-3">
                  {items.map((item: any, idx: number) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleTransactionPress(item)}
                      className="bg-white p-4 rounded-[20px] flex-row items-center justify-between shadow-sm border border-outline/5"
                    >
                      <View className="flex-1 flex-row items-center gap-4 mr-3">
                        <View className={`w-12 h-12 rounded-full items-center justify-center ${
                          item.type === 'INCOME' ? 'bg-secondary/10' : 'bg-error/10'
                        }`}>
                          {item.type === 'INCOME' ? 
                            <ArrowDownLeft size={20} color="#00C853" /> : 
                            <ArrowUpRight size={20} color="#FF5252" />
                          }
                        </View>
                        <View className="flex-1">
                          <Text className="font-bold text-on-surface text-[15px]" numberOfLines={1} ellipsizeMode="tail">
                            {item.description || item.categoryName}
                          </Text>
                          <Text className="text-[10px] text-outline font-bold uppercase tracking-wider">
                            {item.categoryName || 'General'}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end" style={{ flexShrink: 0, minWidth: 90 }}>
                        <Text className={`font-headline font-bold text-[16px] ${
                          item.type === 'INCOME' ? 'text-secondary' : 'text-error'
                        }`}>
                          {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                        </Text>
                        <Text className="text-[9px] text-outline font-medium">
                          {format(parseISO(item.transactionDate), "HH:mm")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </MotiView>
            ))
          )}
        </View>
      </ScrollView>

      <TransactionDetailSheet 
        transaction={selectedTransaction}
        isVisible={isSheetVisible}
        onClose={handleCloseSheet}
      />
    </View>
  );
}
