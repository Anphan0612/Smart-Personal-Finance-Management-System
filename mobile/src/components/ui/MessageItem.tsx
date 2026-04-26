import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Zap, Sparkles } from 'lucide-react-native';
import { ChatMessage } from '../../store/useAppStore';
import { AtelierAICard } from './AtelierAICard';
import { AtelierInsightChart } from './AtelierInsightChart';
import { AtelierSpendingSummary } from './AtelierSpendingSummary';
import { AtelierTransactionCard } from './AtelierTransactionCard';
import { AtelierTokens } from '../../constants/AtelierTokens';

interface MessageItemProps {
  message: ChatMessage;
  onEditTransaction?: (transaction: any) => void;
  onConfirmTransaction?: (transaction: any) => void;
}

export const MessageItem = memo(({ message, onEditTransaction, onConfirmTransaction }: MessageItemProps) => {
  const isUser = message.role === 'user';
  const hasData = !!message.data;

  const renderDataContent = () => {
    if (!message.data) return null;

    if (message.type === 'INSIGHT_CHART' && message.data.chartData) {
      return (
        <AtelierInsightChart
          type={message.data.type || 'pie'}
          data={message.data.chartData}
        />
      );
    }

    if (message.type === 'SUMMARY' && message.data.summary) {
      return (
        <AtelierSpendingSummary
          totalSpent={message.data.summary.totalSpent}
          budgetLimit={message.data.summary.budgetLimit}
          percentage={message.data.summary.percentage}
          currency={message.data.currency}
        />
      );
    }

    if (message.type === 'review_transaction' && message.data.transaction) {
      return (
        <View className="overflow-hidden">
          <View className="bg-ai-primary/5 px-4 py-2.5 rounded-t-[24px] border-x border-t border-outline-variant/10 flex-row items-center gap-2">
            <Sparkles size={14} color={AtelierTokens.colors.ai.primary} />
            <Text className="text-[11px] font-bold text-ai-primary uppercase tracking-[1.5px]">
              Xác nhận giao dịch
            </Text>
          </View>
          <AtelierTransactionCard
            data={message.data.transaction}
            variant="bubble"
            onEdit={() => message.data?.transaction && onEditTransaction?.(message.data.transaction)}
            onConfirm={() => message.data?.transaction && onConfirmTransaction?.(message.data.transaction)}
          />
        </View>
      );
    }

    if (message.data.transactions && Array.isArray(message.data.transactions)) {
      return (
        <View className="gap-3">
          {message.data.transactions.map((txn: any, idx: number) => (
            <AtelierAICard key={idx}>
              <AtelierTransactionCard
                data={txn}
                onConfirm={() => onConfirmTransaction?.(txn)}
                onEdit={() => onEditTransaction?.(txn)}
              />
            </AtelierAICard>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className="flex-row items-start gap-3 max-w-[92%]">
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-ai-primary/10 items-center justify-center mt-1">
            <Zap size={16} color={AtelierTokens.colors.ai.primary} fill={AtelierTokens.colors.ai.primary} />
          </View>
        )}
        <View className="flex-1">
          <View
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-primary rounded-tr-none shadow-sm shadow-primary/20'
                : 'bg-white rounded-tl-none border border-outline-variant/10 shadow-sm'
            }`}
          >
            <Text
              className={`text-[15px] leading-6 ${
                isUser ? 'text-white font-medium' : 'text-surface-on'
              }`}
            >
              {message.content}
            </Text>
          </View>
          
          {hasData && (
            <View className="mt-3 w-full">
              {renderDataContent()}
            </View>
          )}
          
          <Text className="text-[10px] text-outline mt-1.5 ml-1 font-medium opacity-60">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
});

MessageItem.displayName = 'MessageItem';
