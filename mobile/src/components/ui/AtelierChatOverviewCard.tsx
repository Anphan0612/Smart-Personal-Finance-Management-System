import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { AtelierTokens } from '../../constants/AtelierTokens';
import { formatVND } from '../../utils/format';

export type AtelierChatOverviewCategoryRow = { name: string; amount: number };

function pickNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function normalizeCategoryRows(raw: unknown): AtelierChatOverviewCategoryRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const o = row as Record<string, unknown>;
      const name = typeof o.name === 'string' ? o.name : String(o.name ?? '');
      const amount = pickNumber(o.amount) ?? 0;
      if (!name) return null;
      return { name, amount };
    })
    .filter((x): x is AtelierChatOverviewCategoryRow => x !== null);
}

export interface AtelierChatOverviewCardProps {
  narrative: string;
  summary?: Record<string, unknown> | null;
}

export const AtelierChatOverviewCard = ({ narrative, summary }: AtelierChatOverviewCardProps) => {
  const headline = useMemo(() => {
    const h = summary?.aggregateHeadline ?? summary?.headline;
    return typeof h === 'string' && h.trim() ? h.trim() : 'Tổng quan chi tiêu';
  }, [summary]);

  const totalSpent = pickNumber(summary?.totalSpent);
  const transactionCount = pickNumber(summary?.transactionCount);
  const topCategories = useMemo(
    () => normalizeCategoryRows(summary?.topCategories ?? summary?.categories),
    [summary]
  );
  const incomeNote =
    typeof summary?.incomeNote === 'string' && summary.incomeNote.trim()
      ? summary.incomeNote.trim()
      : null;
  const totalIncome = pickNumber(summary?.totalIncome);

  const hasMetrics =
    totalSpent !== undefined ||
    transactionCount !== undefined ||
    topCategories.length > 0 ||
    totalIncome !== undefined;

  const narrativeLines = narrative
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <View className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
      <View className="flex-row items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
        <View className="w-8 h-8 rounded-xl bg-[#0052CC]/10 items-center justify-center">
          <Sparkles size={16} color={AtelierTokens.colors.ai.primary} />
        </View>
        <Text className="flex-1 text-[15px] font-bold text-neutral-900 leading-5">{headline}</Text>
      </View>

      {hasMetrics ? (
        <View className="gap-3 mb-3">
          {totalSpent !== undefined ? (
            <View className="flex-row flex-wrap items-baseline gap-2">
              <Text className="text-[13px] font-semibold text-neutral-600">Tổng chi tiêu:</Text>
              <Text className="text-[15px] font-bold text-neutral-900">{formatVND(totalSpent)}</Text>
            </View>
          ) : null}
          {transactionCount !== undefined ? (
            <View className="flex-row flex-wrap items-baseline gap-2">
              <Text className="text-[13px] font-semibold text-neutral-600">Số giao dịch:</Text>
              <Text className="text-[15px] font-bold text-neutral-900">{transactionCount}</Text>
            </View>
          ) : null}
          {topCategories.length > 0 ? (
            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-neutral-600">
                Các danh mục chi tiêu chính:
              </Text>
              {topCategories.map((row, idx) => (
                <View key={`${row.name}-${idx}`} className="flex-row justify-between gap-2 pl-2">
                  <Text className="text-[14px] text-neutral-800 flex-1" numberOfLines={2}>
                    • {row.name}
                  </Text>
                  <Text className="text-[14px] font-semibold text-neutral-900">
                    {formatVND(row.amount)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {totalIncome !== undefined && totalIncome > 0 ? (
            <View className="flex-row flex-wrap items-baseline gap-2">
              <Text className="text-[13px] font-semibold text-neutral-600">Tổng thu nhập:</Text>
              <Text className="text-[15px] font-bold text-emerald-700">{formatVND(totalIncome)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {narrativeLines.length > 0 ? (
        <View className={hasMetrics ? 'pt-1 border-t border-neutral-100' : ''}>
          {narrativeLines.map((line, i) => (
            <Text
              key={i}
              className={`text-[14px] leading-6 text-neutral-800 ${i > 0 ? 'mt-2' : ''}`}
            >
              {line}
            </Text>
          ))}
        </View>
      ) : null}

      {incomeNote ? (
        <Text className="text-[12px] text-neutral-500 mt-3 leading-5">{incomeNote}</Text>
      ) : null}
    </View>
  );
};
