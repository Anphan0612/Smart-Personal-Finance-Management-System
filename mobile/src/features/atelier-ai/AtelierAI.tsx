import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { X, Zap, Camera, ArrowUp, ArrowDown, TrendingUp, Target, Coffee } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AtelierTypography } from '../../components/ui/AtelierTypography';
import { useAppStore, ChatMessage } from '../../store/useAppStore';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { AtelierActionSheet } from '../../components/ui/AtelierActionSheet';
import { router } from 'expo-router';
import { EditTransactionSheet } from '../../components/ui/EditTransactionSheet';
import { AtelierInsightChart } from '../../components/ui/AtelierInsightChart';
import { AtelierAICard } from '../../components/ui/AtelierAICard';
import { AtelierSpendingSummary } from '../../components/ui/AtelierSpendingSummary';
import { AtelierTransactionCard } from '../../components/ui/AtelierTransactionCard';
import { useAddTransaction, CreateTransactionRequest } from '../../hooks/useTransactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateId, ID_PREFIX } from '../../utils/id';
import { Sparkles } from 'lucide-react-native';

// Feature hooks
import { useAtelierChat, useChatScroll, useProactiveInsights } from './hooks';
import { ChatList } from './components';

const { height: screenHeight } = Dimensions.get('window');

interface AtelierAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtelierAI = ({ isOpen, onClose }: AtelierAIProps) => {
  const { activeWalletId, addMessage } = useAppStore();
  const addTransactionMutation = useAddTransaction();

  // Separate input state from messages to prevent re-renders
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const editSheetRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  // Custom hooks for separated concerns
  const { messages, isProcessing, sendMessage } = useAtelierChat();
  const { scrollViewRef, handleScroll, scrollToBottom, isNearBottom } = useChatScroll({
    isOpen,
    messagesLength: messages.length,
  });
  useProactiveInsights(isOpen, activeWalletId);

  // Update scroll button visibility based on scroll position
  const handleScrollWithButton = useCallback((event: any) => {
    handleScroll(event);
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollToBottom(distanceFromBottom > 150 && contentSize.height > layoutMeasurement.height);
  }, [handleScroll]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setInputHeight(40);

    await sendMessage(userMessage);
  }, [input, isProcessing, sendMessage]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setInput(suggestion);
    Haptics.selectionAsync();
  }, []);

  const handleSelectSource = useCallback((source: 'camera' | 'library') => {
    setIsSheetVisible(false);
    setTimeout(() => {
      router.push({
        pathname: '/receipt',
        params: { source }
      });
    }, 300);
  }, []);

  const onSaveReview = useCallback(async (data: CreateTransactionRequest) => {
    try {
      await addTransactionMutation.mutateAsync(data);
      addMessage({
        id: generateId(ID_PREFIX.MESSAGE),
        role: 'assistant',
        content: `I've successfully saved your transaction.`,
        timestamp: Date.now(),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  }, [addTransactionMutation, addMessage]);

  const renderSuggestions = useCallback(() => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-3"
      contentContainerStyle={{ gap: 8 }}
    >
      {[
        { text: 'View spending trends', icon: <TrendingUp size={14} color="#0052CC" /> },
        { text: 'Set a savings goal', icon: <Target size={14} color="#0052CC" /> },
        { text: 'Review last week', icon: <Coffee size={14} color="#0052CC" /> },
      ].map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleSuggestionPress(suggestion.text)}
          className="flex-row items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-neutral-100 shadow-sm"
        >
          {suggestion.icon}
          <Text className="text-[13px] font-medium text-neutral-700">{suggestion.text}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [handleSuggestionPress]);

  const renderDataContent = useCallback((message: ChatMessage) => {
    const { data, type } = message;
    if (!data) return null;

    if (type === 'INSIGHT_CHART' && data.chartData) {
      return (
        <AtelierInsightChart
          type={data.type || 'pie'}
          data={data.chartData}
          title={data.title}
          insight={data.insight}
        />
      );
    }

    if (type === 'SUMMARY' && data.summary) {
      return (
        <AtelierSpendingSummary
          totalSpent={data.summary.totalSpent}
          budgetLimit={data.summary.budgetLimit}
          percentage={data.summary.percentage}
          currency={data.currency}
        />
      );
    }

    if (type === 'review_transaction' && data.transaction) {
      return (
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
          <View className="bg-[#0052CC]/5 px-4 py-2 border-b border-neutral-50 flex-row items-center gap-2">
            <Sparkles size={14} color="#0052CC" />
            <Text className="text-[12px] font-bold text-[#0052CC] uppercase tracking-wider">
              Verify Transaction
            </Text>
          </View>
          <AtelierTransactionCard
            data={data.transaction}
            onEdit={() => data.transaction && editSheetRef.current?.open(data.transaction)}
          />
        </View>
      );
    }

    if (data.transactions && Array.isArray(data.transactions)) {
      return (
        <View className="gap-3">
          {data.transactions.map((txn: any, idx: number) => (
            <AtelierAICard key={idx}>
              <AtelierTransactionCard data={txn} variant="bubble" />
            </AtelierAICard>
          ))}
        </View>
      );
    }

    return null;
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 100 }]}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={StyleSheet.absoluteFill}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={onClose}
              >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
              </Pressable>
            </MotiView>

            <MotiView
              from={{ translateY: screenHeight }}
              animate={{ translateY: 0 }}
              exit={{ translateY: screenHeight }}
              transition={{ type: 'timing', duration: 300 }}
              style={{
                marginTop: insets.top + 20,
                flex: 1,
                backgroundColor: '#F9F9FF',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 pt-6 pb-4 bg-[#F9F9FF] border-b border-neutral-100/50">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-[#0052CC] items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap size={24} color="white" fill="white" />
                  </View>
                  <View>
                    <AtelierTypography variant="h3" className="text-neutral-900 font-bold">
                      Atelier AI
                    </AtelierTypography>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2 h-2 rounded-full bg-[#4caf50]" />
                      <AtelierTypography variant="caption" className="text-neutral-500 font-bold tracking-widest text-[10px]">
                        ONLINE • PREMIUM CONCIERGE
                      </AtelierTypography>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-neutral-100"
                >
                  <X size={20} color="#171A1F" />
                </TouchableOpacity>
              </View>

              {/* Chat Content */}
              <KeyboardAwareScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
                onScroll={handleScrollWithButton}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
                bottomOffset={inputHeight + Math.max(insets.bottom, 24) + 40}
              >
                <ChatList
                  messages={messages}
                  isProcessing={isProcessing}
                  renderDataContent={renderDataContent}
                />
              </KeyboardAwareScrollView>

              {/* Scroll to Bottom Button */}
              <AnimatePresence>
                {showScrollToBottom && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-5 z-10"
                    style={{ bottom: inputHeight + Math.max(insets.bottom, 24) + 60 }}
                  >
                    <TouchableOpacity
                      onPress={scrollToBottom}
                      className="w-10 h-10 rounded-full bg-[#0052CC] items-center justify-center shadow-lg"
                    >
                      <ArrowDown size={20} color="white" />
                    </TouchableOpacity>
                  </MotiView>
                )}
              </AnimatePresence>

              {/* Footer */}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View
                  className="bg-white border-t border-neutral-50"
                  style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                >
                  {renderSuggestions()}

                  <View className="px-4 pb-2 flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => setIsSheetVisible(true)}
                      className="w-11 h-11 rounded-full bg-[#F2F3F7] items-center justify-center"
                    >
                      <Camera size={22} color="#0052CC" />
                    </TouchableOpacity>

                    <View className="flex-1 flex-row items-end bg-[#F2F3F7] rounded-[24px] px-4 py-2">
                      <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask about your finance"
                        placeholderTextColor="#9BA1B0"
                        multiline
                        onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                        style={{
                          flex: 1,
                          color: '#171A1F',
                          fontFamily: 'Inter-Medium',
                          fontSize: 15,
                          maxHeight: 120,
                          paddingTop: Platform.OS === 'ios' ? 8 : 4,
                          paddingBottom: Platform.OS === 'ios' ? 8 : 4,
                        }}
                      />
                      <TouchableOpacity
                        onPress={handleSend}
                        disabled={isProcessing || !input.trim()}
                        className={`w-9 h-9 rounded-full items-center justify-center ml-2 ${
                          isProcessing || !input.trim() ? 'bg-neutral-300' : 'bg-[#0052CC]'
                        }`}
                      >
                        <ArrowUp size={20} color="white" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </MotiView>
          </View>
        )}
      </AnimatePresence>

      <EditTransactionSheet ref={editSheetRef} onSave={onSaveReview} />
      <AtelierActionSheet
        isVisible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSelectCamera={() => handleSelectSource('camera')}
        onSelectGallery={() => handleSelectSource('library')}
      />
    </>
  );
};
