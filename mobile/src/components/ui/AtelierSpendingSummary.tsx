import React from 'react';
import { View } from 'react-native';
import { AtelierTypography } from './AtelierTypography';
import { AtelierTokens } from '../../constants/AtelierTokens';
import { TrendingUp, PieChart } from 'lucide-react-native';

interface AtelierSpendingSummaryProps {
  totalSpent: number;
  budgetLimit: number;
  percentage: number;
  currency?: string;
}

export const AtelierSpendingSummary = ({
  totalSpent,
  budgetLimit,
  percentage,
  currency = '₫',
}: AtelierSpendingSummaryProps) => {
  const isOverBudget = percentage > 100;
  const progressWidth = Math.min(percentage, 100);

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <View className="p-2 bg-white/10 rounded-xl">
            <PieChart size={18} color="white" />
          </View>
          <AtelierTypography variant="h3" className="text-[15px] font-bold text-white">
            Spending Summary
          </AtelierTypography>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full ${isOverBudget ? 'bg-error/20' : 'bg-white/20'}`}
        >
          <AtelierTypography
            variant="label"
            className={`text-[10px] font-bold ${isOverBudget ? 'text-white' : 'text-white/80'}`}
          >
            {isOverBudget ? 'Over Budget' : 'On Track'}
          </AtelierTypography>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row items-baseline gap-1">
          <AtelierTypography variant="h2" className="text-[24px] font-bold text-white">
            {totalSpent.toLocaleString()}
          </AtelierTypography>
          <AtelierTypography
            variant="body"
            className="text-[14px] text-white/60"
          >
            {currency} / {budgetLimit.toLocaleString()} {currency}
          </AtelierTypography>
        </View>
        <AtelierTypography
          variant="label"
          className="text-[12px] text-white/50 mt-1"
        >
          You&apos;ve spent {percentage}% of your planned budget
        </AtelierTypography>
      </View>

      {/* Progress Bar Container */}
      <View className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
        {/* Progress Fill */}
        <View
          className={`h-full rounded-full ${isOverBudget ? 'bg-error' : 'bg-white/80'}`}
          style={{ width: `${progressWidth}%` }}
        />
      </View>

      {/* Footer Info */}
      <View className="flex-row items-center gap-1.5 mt-4 pt-4 border-t border-white/10">
        <TrendingUp size={14} color="rgba(255,255,255,0.4)" />
        <AtelierTypography
          variant="label"
          className="text-[11px] text-white/40"
        >
          Your spending is 5% lower than last month
        </AtelierTypography>
      </View>
    </View>
  );
};
