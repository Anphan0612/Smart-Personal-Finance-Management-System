import React, { useState, useMemo, useRef } from 'react';
import { View, FlatList, TextInput, Alert, RefreshControl } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { MotiView } from 'moti';
import { Search } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { TransactionListItem } from './components/TransactionListItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionDetailSheet from './components/TransactionDetailSheet';
import {
  AtelierTypography,
  AtelierCard,
  SkeletonBox,
} from '@/components/ui';
import { Colors } from '@/constants/tokens';
import { TransactionPresentationMapper } from './presentation/TransactionPresentationMapper';
import { Transaction } from '@/domain/entities/Transaction';
import { TransactionResponse } from '@/types/api';

const toTransactionResponse = (transaction: Transaction): TransactionResponse => ({
  id: transaction.id,
  walletId: transaction.walletId,
  categoryId: transaction.categoryId,
  categoryName: transaction.categoryName,
  iconName: transaction.iconName,
  isAiSuggested: transaction.isAiSuggested,
  amount: transaction.amount,
  description: transaction.description,
  type: transaction.type,
  transactionDate: transaction.transactionDate.toISOString(),
  createdAt: transaction.createdAt.toISOString(),
  receiptImageUrl: transaction.receiptImageUrl,
});

const TransactionSkeleton = () => (
  <AtelierCard elevation="lowest" padding="sm" className="mb-3">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const openRowRef = useRef<Swipeable | null>(null);
  const deleteMutation = useDeleteTransaction();

  const handleSwipeOpen = (ref: Swipeable) => {
    if (openRowRef.current && openRowRef.current !== ref) {
      openRowRef.current.close();
    }
    openRowRef.current = ref;
  };

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useTransactions(activeWalletId || '');

  const allTransactions = useMemo(() => {
    if (!data?.pages) return [];
    return TransactionPresentationMapper.flattenPages(data.pages);
  }, [data]);

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditMode(false);
    setIsSheetVisible(true);
  };

  const handleEdit = (transaction: Transaction) => {
    if (openRowRef.current) {
      openRowRef.current.close();
    }
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsSheetVisible(true);
  };

  const handleDelete = (transaction: Transaction | TransactionResponse) => {
    if (openRowRef.current) {
      openRowRef.current.close();
    }
    Alert.alert(
      'Xóa giao dịch',
      'Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(transaction.id);
              if (isSheetVisible) {
                handleCloseSheet();
              }
              Toast.show({
                type: 'success',
                text1: 'Đã xóa giao dịch',
                text2: 'Giao dịch đã được loại bỏ khỏi hệ thống.',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Lỗi khi xóa',
                text2: 'Không thể xóa giao dịch. Vui lòng thử lại sau.',
              });
            }
          },
        },
      ]
    );
  };

  const handleCloseSheet = () => {
    setIsSheetVisible(false);
    setSelectedTransaction(null);
    setIsEditMode(false);
  };

  const groupedTransactions = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) return [];
    return TransactionPresentationMapper.groupAndFilter(allTransactions, searchQuery);
  }, [allTransactions, searchQuery]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View className="h-20" />;
    return (
      <View className="py-4 gap-3">
        {[1, 2, 3].map((i) => (
          <TransactionSkeleton key={`footer-skele-${i}`} />
        ))}
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
      <View className="relative flex-row items-center bg-white rounded-[24px] px-5 py-4 shadow-atelier-low">
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


  const renderItem = ({
    item,
    index,
  }: {
    item: { date: string; dateLabel: string; items: Transaction[] };
    index: number;
  }) => (
    <MotiView
      key={item.date}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 50 }}
      className="mb-8"
    >
      <AtelierTypography variant="label" className="text-neutral-400 mb-4 px-1">
        {item.dateLabel}
      </AtelierTypography>
      <View className="gap-3">
        {item.items.map((transaction: Transaction) => (
          <TransactionListItem
            key={transaction.id}
            transaction={transaction}
            onPress={() => handleTransactionPress(transaction)}
            onEdit={() => handleEdit(transaction)}
            onDelete={() => handleDelete(transaction)}
            onSwipeableWillOpen={(ref) => handleSwipeOpen(ref)}
          />
        ))}
      </View>
    </MotiView>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          {[1, 2, 3, 4].map((i) => (
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
        <AtelierTypography variant="h3" className="text-neutral-400">
          Không tìm thấy giao dịch
        </AtelierTypography>
        <AtelierTypography variant="body" className="text-neutral-400/60 mt-1">
          Hãy thử trò chuyện với AI để thêm mới!
        </AtelierTypography>
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
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingHorizontal: 24,
          paddingBottom: 220,
        }}
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
        transaction={selectedTransaction ? toTransactionResponse(selectedTransaction) : null}
        isVisible={isSheetVisible}
        onClose={handleCloseSheet}
        initialEditMode={isEditMode}
        onDelete={handleDelete}
      />
    </View>
  );
}
