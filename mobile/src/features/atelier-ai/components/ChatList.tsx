import React, { memo } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { Zap, Sparkles } from 'lucide-react-native';
import { ChatMessage } from '../../../store/useAppStore';
import { MessageItem } from './MessageItem';
import { AtelierTypography } from '../../../components/ui/AtelierTypography';

interface ChatListProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  renderDataContent: (message: ChatMessage) => React.ReactNode;
}

export const ChatList = memo<ChatListProps>(({ messages, isProcessing, renderDataContent }) => {
  return (
    <>
      {messages.length === 0 && !isProcessing && (
        <View className="items-center justify-center py-10 opacity-60">
          <View className="w-16 h-16 rounded-3xl bg-white items-center justify-center shadow-sm mb-4">
            <Sparkles size={32} color="#0052CC" />
          </View>
          <AtelierTypography variant="body" className="text-center text-neutral-500 px-10">
            Hi! I&apos;m your AI financial assistant. Ask me anything about your spending, budgets, or goals.
          </AtelierTypography>
        </View>
      )}

      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          renderDataContent={renderDataContent}
        />
      ))}

      {isProcessing && (
        <View className="flex-row items-center gap-3 mb-6">
          <View className="w-8 h-8 rounded-full bg-[#0052CC]/10 items-center justify-center">
            <Zap size={16} color="#0052CC" fill="#0052CC" />
          </View>
          <View className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-neutral-100 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#0052CC" />
            <Text className="text-[14px] text-neutral-500 font-medium italic">Atelier is thinking...</Text>
          </View>
        </View>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if messages array length changes or processing state changes
  return (
    prevProps.messages.length === nextProps.messages.length &&
    prevProps.isProcessing === nextProps.isProcessing &&
    prevProps.messages[prevProps.messages.length - 1]?.id === nextProps.messages[nextProps.messages.length - 1]?.id
  );
});

ChatList.displayName = 'ChatList';
