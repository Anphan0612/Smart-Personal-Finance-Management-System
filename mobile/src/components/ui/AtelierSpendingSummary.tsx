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
    <View
      className="mt-4 bg-surface-container-low/90 rounded-3xl p-5 border border-outline-variant/20 shadow-lg shadow-black/5"
      style={{ overflow: 'hidden' }}
    >
      {/* Background Glow Effect */}
      <View
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: AtelierTokens.colors.ai.primary }}
      />

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <View className="p-2 bg-ai-primary/10 rounded-xl">
            <PieChart size={18} color={AtelierTokens.colors.ai.primary} />
          </View>
          <AtelierTypography variant="h3" className="text-[15px] font-bold text-surface-on">
            Spending Summary
          </AtelierTypography>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full ${isOverBudget ? 'bg-error/10' : 'bg-primary/10'}`}
        >
          <AtelierTypography
            variant="label"
            className={`text-[10px] font-bold ${isOverBudget ? 'text-error' : 'text-primary'}`}
          >
            {isOverBudget ? 'Over Budget' : 'On Track'}
          </AtelierTypography>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row items-baseline gap-1">
          <AtelierTypography variant="h2" className="text-[24px] font-bold text-surface-on">
            {totalSpent.toLocaleString()}
          </AtelierTypography>
          <AtelierTypography
            variant="body"
            className="text-[14px] text-surface-on-variant opacity-60"
          >
            {currency} / {budgetLimit.toLocaleString()} {currency}
          </AtelierTypography>
        </View>
        <AtelierTypography
          variant="label"
          className="text-[12px] text-surface-on-variant mt-1 opacity-70"
        >
          You&apos;ve spent {percentage}% of your planned budget
        </AtelierTypography>
      </View>

      {/* Progress Bar Container */}
      <View className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
        {/* Progress Fill with Gradient-like effect via background color */}
        <View
          className={`h-full rounded-full ${isOverBudget ? 'bg-error' : 'bg-primary'}`}
          style={{ width: `${progressWidth}%` }}
        />
      </View>

      {/* Footer Info */}
      <View className="flex-row items-center gap-1.5 mt-4 pt-4 border-t border-outline-variant/10">
        <TrendingUp size={14} color={AtelierTokens.colors.outline} />
        <AtelierTypography
          variant="label"
          className="text-[11px] text-surface-on-variant opacity-60"
        >
          Your spending is 5% lower than last month
        </AtelierTypography>
      </View>
    </View>
  );
};
