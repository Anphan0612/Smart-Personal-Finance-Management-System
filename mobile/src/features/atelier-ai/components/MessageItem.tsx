import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';
import { ChatMessage } from '../../../store/useAppStore';

interface MessageItemProps {
  message: ChatMessage;
  renderDataContent?: (message: ChatMessage) => React.ReactNode;
}

export const MessageItem = memo<MessageItemProps>(({ message, renderDataContent }) => {
  const isUser = message.role === 'user';
  const hasData = !!message.data;

  return (
    <View className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className="flex-row items-start gap-3 max-w-[85%]">
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#0052CC]/10 items-center justify-center mt-1">
            <Zap size={16} color="#0052CC" fill="#0052CC" />
          </View>
        )}
        <View>
          <View
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-[#0052CC] rounded-tr-none'
                : 'bg-white rounded-tl-none border border-neutral-100'
            }`}
          >
            <Text
              className={`text-[15px] leading-6 ${
                isUser ? 'text-white' : 'text-neutral-800'
              }`}
            >
              {message.content}
            </Text>
          </View>

          {hasData && renderDataContent && (
            <View className="mt-3 w-[280px]">
              {renderDataContent(message)}
            </View>
          )}

          <Text className="text-[10px] text-neutral-400 mt-1.5 ml-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if message content or data changes
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isStreaming === nextProps.message.isStreaming &&
    JSON.stringify(prevProps.message.data) === JSON.stringify(nextProps.message.data)
  );
});

MessageItem.displayName = 'MessageItem';
