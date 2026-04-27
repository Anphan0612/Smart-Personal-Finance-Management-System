import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';

import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { X, Zap, Sparkles, Coffee, ArrowUp, ArrowDown, Camera, TrendingUp, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

// Internal Components
import { AtelierTypography } from './AtelierTypography';
import { AtelierActionSheet } from './AtelierActionSheet';
import { EditTransactionSheet } from './EditTransactionSheet';
import { MessageItem } from './MessageItem';

// Store & Hooks
import { useAppStore, ChatMessage } from '../../store/useAppStore';
import { useAddTransaction, CreateTransactionRequest } from '../../hooks/useTransactions';
import { fetcher, poster } from '../../services/api';

// Utils
import { generateId, ID_PREFIX } from '../../utils/id';
import { formatCurrency } from '../../utils/format';

const { height: screenHeight } = Dimensions.get('window');

interface AtelierAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtelierAI = ({ isOpen, onClose }: AtelierAIProps) => {
  const router = useRouter();
  const { messages, addMessage, activeWalletId } = useAppStore();
  const addTransactionMutation = useAddTransaction();
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const editSheetRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  
  const [inputHeight, setInputHeight] = useState(40);
  const isNearBottomRef = useRef(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const nearBottom = distanceFromBottom < 150;
    isNearBottomRef.current = nearBottom;
    setShowScrollToBottom(!nearBottom && contentSize.height > layoutMeasurement.height);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && isNearBottomRef.current && isOpen) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isOpen]);

  useEffect(() => {
    if (!isOpen || !activeWalletId) return;

    const fetchInitialInsights = async () => {
      try {
        const response: any = await fetcher(`/ai/proactive-insights?walletId=${activeWalletId}`);
        if (response && response.message) {
          addMessage({
            id: generateId(ID_PREFIX.MESSAGE),
            role: 'assistant',
            content: response.message,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error fetching initial insights:', error);
      }
    };

    if (messages.length === 0) {
      fetchInitialInsights();
    }
  }, [isOpen, activeWalletId, messages.length, addMessage]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    if (!activeWalletId) {
      Alert.alert('Thông báo', 'Vui lòng chọn ví để bắt đầu trò chuyện với Atelier AI');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setInputHeight(40);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    addMessage({
      id: generateId(ID_PREFIX.MESSAGE),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    setIsProcessing(true);
    scrollToBottom();

    try {
      // ─── Smart Orchestration: Always try /ai/chat first ───
      const response: any = await poster('/ai/chat', {
        message: userMessage,
        walletId: activeWalletId,
      });

      if (response) {
        // ─── Fallback to Extract: If backend identifies COMMAND intent ───
        if (response.type === 'COMMAND') {
          const extractResponse: any = await poster('/ai/extract-transaction', {
            text: userMessage,
          });

          if (extractResponse) {
            addMessage({
              id: generateId(ID_PREFIX.MESSAGE),
              role: 'assistant',
              content: `Mình đã nhận diện được giao dịch này. Bạn có muốn lưu lại không?`,
              type: 'review_transaction',
              data: { transaction: extractResponse },
              timestamp: Date.now(),
            });
          }
        } else {
          // ─── Standard AI Response (QUERY, SUMMARY, INSIGHT_CHART, DEFAULT) ───
          addMessage({
            id: generateId(ID_PREFIX.MESSAGE),
            role: 'assistant',
            content: response.message || (response.type === 'QUERY' ? 'Đây là kết quả mình tìm được:' : 'Atelier đã xử lý xong yêu cầu của bạn.'),
            data: response.data,
            type: response.type,
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      addMessage({
        id: generateId(ID_PREFIX.MESSAGE),
        role: 'assistant',
        content: 'Xin lỗi, Atelier gặp chút trục trặc. Bạn thử lại nhé!',
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
      scrollToBottom();
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
    Haptics.selectionAsync();
  };

  const handleSelectSource = (source: 'camera' | 'library') => {
    setIsSheetVisible(false);
    setTimeout(() => {
      // Navigate to receipt screen
      router.push({ pathname: '/receipt/scanner' as any, params: { source } });
    }, 300);
  };

  const onSaveReview = async (data: CreateTransactionRequest) => {
    try {
      console.log('[ATELIER AI] Preparing to save transaction:', data);
      
      // Ensure all fields meet TransactionValidator requirements
      const payload: CreateTransactionRequest = {
        ...data,
        amount: Number(data.amount) || 0,
        description: data.description?.trim() ? data.description : 'Giao dịch từ AI',
        walletId: data.walletId || activeWalletId || '',
        transactionDate: data.transactionDate || new Date().toISOString(),
      };

      console.log('[ATELIER AI] Normalized payload:', payload);

      await addTransactionMutation.mutateAsync(payload);
      addMessage({
        id: generateId(ID_PREFIX.MESSAGE),
        role: 'assistant',
        content: `Đã lưu giao dịch ${formatCurrency(payload.amount)}.`,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error('[ATELIER AI ERROR] Failed to save transaction:', error);
      if (error?.errors) {
        console.error('[ATELIER AI ERROR] Validation details:', error.errors);
        const errorDetails = error.errors.map((e: any) => e.message).join('\n');
        Alert.alert('Lỗi dữ liệu', errorDetails);
      } else {
        Alert.alert('Lỗi', error?.message || 'Không thể lưu giao dịch');
      }
    }
  };

  const renderSuggestions = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-3"
      contentContainerStyle={{ gap: 8 }}
    >
      {[
        { text: 'Xem xu hướng chi tiêu', icon: <TrendingUp size={14} color="#0052CC" /> },
        { text: 'Đặt mục tiêu tiết kiệm', icon: <Target size={14} color="#0052CC" /> },
        { text: 'Tổng kết tuần qua', icon: <Coffee size={14} color="#0052CC" /> },
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
  );

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageItem 
      message={item} 
      onEditTransaction={(txn) => editSheetRef.current?.open(txn)} 
      onConfirmTransaction={onSaveReview}
    />
  ), [onSaveReview]);

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
              <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
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

              <FlatList
                ref={scrollViewRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={!isProcessing ? (
                  <View className="items-center justify-center py-10 opacity-60">
                    <View className="w-16 h-16 rounded-3xl bg-white items-center justify-center shadow-sm mb-4">
                      <Sparkles size={32} color="#0052CC" />
                    </View>
                    <AtelierTypography variant="body" className="text-center text-neutral-500 px-10">
                      Chào bạn! Mình là Atelier AI. Bạn cần giúp gì về tài chính hôm nay?
                    </AtelierTypography>
                  </View>
                ) : null}
                ListFooterComponent={isProcessing ? (
                  <View className="flex-row items-center gap-3 mb-6">
                    <View className="w-8 h-8 rounded-full bg-[#0052CC]/10 items-center justify-center">
                      <Zap size={16} color="#0052CC" fill="#0052CC" />
                    </View>
                    <View className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-neutral-100 flex-row items-center gap-2">
                      <ActivityIndicator size="small" color="#0052CC" />
                      <Text className="text-[14px] text-neutral-500 font-medium italic">Atelier đang suy nghĩ...</Text>
                    </View>
                  </View>
                ) : <View style={{ height: 20 }} />}
              />

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
                        placeholder="Hỏi về tài chính của bạn"
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
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <ArrowUp size={20} color="white" strokeWidth={3} />
                        )}
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
