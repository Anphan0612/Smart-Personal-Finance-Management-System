import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Coffee,
  Tag,
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Zap,
  Heart,
  Edit3,
  Check,
} from 'lucide-react-native';
import { AtelierTypography } from './AtelierTypography';
import { AtelierCard } from './AtelierCard';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { AtelierTokens } from '../../constants/AtelierTokens';

interface TransactionData {
  id?: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  note: string;
  confidence: number;
  categoryId?: string | null;
  walletId?: string;
}

interface AtelierTransactionCardProps {
  data: TransactionData;
  onConfirm?: () => void;
  onEdit?: () => void;
  variant?: 'default' | 'bubble';
  isPending?: boolean;
  isConfirmed?: boolean;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('coffee') || cat.includes('uống')) return Coffee;
  if (cat.includes('ăn') || cat.includes('food')) return Utensils;
  if (cat.includes('shopping') || cat.includes('mua sắm')) return ShoppingBag;
  if (cat.includes('home') || cat.includes('nhà')) return Home;
  if (cat.includes('transport') || cat.includes('di chuyển')) return Car;
  if (cat.includes('bill') || cat.includes('hóa đơn')) return Zap;
  if (cat.includes('health') || cat.includes('sức khỏe')) return Heart;
  return Tag;
};

export const AtelierTransactionCard = ({
  data,
  onConfirm,
  onEdit,
  variant = 'default',
  isPending = false,
  isConfirmed = false,
}: AtelierTransactionCardProps) => {
  const Icon = getCategoryIcon(data.category);
  const formattedAmount = formatCurrency(data.amount);

  const isBubble = variant === 'bubble';

  const Container = AtelierCard;
  const containerProps = isBubble
    ? {
        elevation: 'lowest' as const,
        padding: 'md' as const,
        className:
          'w-full bg-surface-container-lowest border border-outline-variant/10 rounded-[24px] shadow-sm shadow-black/5',
      }
    : {
        elevation: 'lowest' as const,
        padding: 'md' as const,
        className: 'mt-4 w-full bg-surface-card/30 border border-surface-elevated/50',
      };

  return (
    <Container {...containerProps}>
      {/* Header Area */}
      <View className="flex-row items-center justify-between mb-4 gap-2">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-full bg-ai-primary/10 flex items-center justify-center shrink-0">
            <Icon size={20} color={AtelierTokens.colors.ai.primary} />
          </View>
          <View className="flex-1 pr-2">
            <AtelierTypography
              variant="h3"
              className="text-[15px] font-bold text-surface-on"
              numberOfLines={1}
            >
              {data.note || 'Giao dịch mới'}
            </AtelierTypography>
            <AtelierTypography
              variant="label"
              className="text-[10px] text-surface-on-variant uppercase tracking-[1.5px] font-bold opacity-60 mt-0.5"
            >
              {data.type === 'EXPENSE' ? 'Khoản chi' : 'Khoản thu'}
            </AtelierTypography>
          </View>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full shrink-0 border ${isConfirmed ? 'bg-ai-primary/10 border-ai-primary/20' : 'bg-surface-container-high border-outline-variant/20'}`}
        >
          <AtelierTypography
            variant="label"
            className={`text-[9px] font-bold uppercase tracking-wider ${isConfirmed ? 'text-ai-primary' : 'text-surface-on-variant'}`}
          >
            {isConfirmed ? 'Đã lưu' : 'Đang chờ'}
          </AtelierTypography>
        </View>
      </View>

      {/* Details Box */}
      <View className="bg-surface-container-low rounded-2xl p-4 mb-4 border border-outline-variant/10 shadow-sm shadow-black/5">
        {/* Amount Row */}
        <View className="flex-row items-baseline justify-between mb-4 pb-4 border-b border-outline-variant/10">
          <AtelierTypography
            variant="label"
            className="text-[10px] text-surface-on-variant font-bold uppercase tracking-widest opacity-50"
          >
            SỐ TIỀN
          </AtelierTypography>
          <AtelierTypography
            variant="h2"
            className={`text-[20px] font-bold ${data.type === 'EXPENSE' ? 'text-error' : 'text-primary'}`}
          >
            {data.type === 'EXPENSE' ? '-' : '+'}
            {formattedAmount}
          </AtelierTypography>
        </View>

        {/* Info Grid (2 Columns) */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-1"
            onPress={onEdit}
            activeOpacity={0.7}
            disabled={isPending}
          >
            <AtelierTypography
              variant="label"
              className="text-[10px] uppercase font-bold text-surface-on-variant opacity-50 tracking-widest mb-1.5"
            >
              DANH MỤC
            </AtelierTypography>
            <View className="flex-row items-center gap-1.5">
              <AtelierTypography
                variant="body"
                className={`text-[14px] font-bold ${!data.categoryId ? 'text-error' : 'text-surface-on'}`}
                numberOfLines={1}
              >
                {data.category || 'Cần chọn'}
              </AtelierTypography>
              <Edit3
                size={12}
                color={!data.categoryId ? AtelierTokens.colors.error : AtelierTokens.colors.outline}
              />
            </View>
          </TouchableOpacity>

          <View className="w-[1px] bg-outline-variant/20 mx-3" />

          <View className="flex-1">
            <AtelierTypography
              variant="label"
              className="text-[10px] uppercase font-bold text-surface-on-variant opacity-50 tracking-widest mb-1.5"
            >
              NGÀY & GIỜ
            </AtelierTypography>
            <AtelierTypography variant="body" className="text-[14px] font-bold text-surface-on">
              {formatDateTime(data.date)}
            </AtelierTypography>
          </View>
        </View>
      </View>

      {/* Action Buttons or Saved State */}
      <View className="flex-row gap-3">
        {isConfirmed ? (
          <View className="flex-1 py-4 bg-ai-primary/10 rounded-2xl items-center justify-center border border-ai-primary/20 flex-row gap-2">
            <View className="w-5 h-5 rounded-full bg-ai-primary items-center justify-center">
              <Check size={12} color="white" />
            </View>
            <AtelierTypography variant="label" className="text-ai-primary font-bold normal-case">
              Đã lưu thành công
            </AtelierTypography>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={isPending}
              className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-lg ${isPending ? 'bg-primary/50' : 'bg-primary shadow-primary/20'}`}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <AtelierTypography
                  variant="label"
                  className="text-white text-[14px] font-bold normal-case"
                >
                  Xác nhận
                </AtelierTypography>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onEdit}
              activeOpacity={0.7}
              disabled={isPending}
              className={`flex-1 py-4 bg-surface-container-high rounded-2xl items-center justify-center border border-outline-variant/10 ${isPending ? 'opacity-50' : ''}`}
            >
              <AtelierTypography
                variant="label"
                className="text-surface-on text-[14px] font-bold normal-case"
              >
                Sửa chi tiết
              </AtelierTypography>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Container>
  );
};
