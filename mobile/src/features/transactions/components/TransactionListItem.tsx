import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Edit3, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { AtelierCard, AtelierTypography } from '@/components/ui';
import { Colors } from '@/constants/tokens';
import { Transaction } from '@/domain/entities/Transaction';
import { formatCurrency, formatTime } from '@/utils/format';

interface TransactionListItemProps {
  transaction: Transaction;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSwipeableWillOpen?: (ref: Swipeable) => void;
}

export const TransactionListItem = React.forwardRef<Swipeable, TransactionListItemProps>(({
  transaction,
  onPress,
  onEdit,
  onDelete,
  onSwipeableWillOpen,
}, ref) => {
  const internalRef = React.useRef<Swipeable>(null);

  // Expose the internal ref to the parent ref
  React.useImperativeHandle(ref, () => internalRef.current!);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <View className="flex-row items-center ml-4 h-full py-0.5">
        <Animated.View style={{ transform: [{ scale }], opacity, height: '100%' }}>
          <TouchableOpacity
            onPress={() => {
              internalRef.current?.close();
              onEdit();
            }}
            className="bg-primary w-[60px] h-full items-center justify-center rounded-[24px] mr-2 shadow-lg shadow-primary/30"
            activeOpacity={0.8}
          >
            <Edit3 size={20} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale }], opacity, height: '100%' }}>
          <TouchableOpacity
            onPress={() => {
              internalRef.current?.close();
              onDelete();
            }}
            className="bg-[#FF4B4B] w-[60px] h-full items-center justify-center rounded-[24px] shadow-lg shadow-error/30"
            activeOpacity={0.8}
          >
            <Trash2 size={20} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={internalRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        if (onSwipeableWillOpen && internalRef.current) {
          onSwipeableWillOpen(internalRef.current);
        }
      }}
      friction={1.5}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={{ overflow: 'visible' }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
      >
        <AtelierCard 
          elevation="lowest" 
          padding="sm" 
          className="bg-white border border-outline/5"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-4 mr-3">
              <View
                className={`w-12 h-12 rounded-[20px] items-center justify-center ${
                  transaction.isIncome() ? 'bg-secondary/10' : 'bg-error/10'
                }`}
              >
                {transaction.isIncome() ? (
                  <ArrowDownLeft size={22} color={Colors.secondary.DEFAULT} strokeWidth={2.5} />
                ) : (
                  <ArrowUpRight size={22} color={Colors.error} strokeWidth={2.5} />
                )}
              </View>
              <View className="flex-1">
                <AtelierTypography variant="h3" className="text-[15px] font-semibold text-neutral-900" numberOfLines={1}>
                  {transaction.description || transaction.categoryName}
                </AtelierTypography>
                <AtelierTypography variant="label" className="text-neutral-400 text-[11px] mt-0.5">
                  {transaction.categoryName || 'Chung'}
                </AtelierTypography>
              </View>
            </View>
            <View className="items-end">
              <AtelierTypography
                variant="h3"
                className={`text-[16px] font-bold ${
                  transaction.isIncome() ? 'text-green-600' : 'text-error'
                }`}
              >
                {transaction.isIncome() ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </AtelierTypography>
              <AtelierTypography variant="caption" className="text-neutral-400 text-[10px] mt-0.5">
                {formatTime(transaction.transactionDate.toISOString())}
              </AtelierTypography>
            </View>
          </View>
        </AtelierCard>
      </TouchableOpacity>
    </Swipeable>
  );
});

TransactionListItem.displayName = 'TransactionListItem';
