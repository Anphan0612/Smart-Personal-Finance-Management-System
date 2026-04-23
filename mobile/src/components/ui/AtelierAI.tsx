import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert, Text, Modal } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { X, Bolt, Sparkles, Coffee, ArrowUp, Camera, Plus, Edit3 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { AtelierTypography } from "./AtelierTypography";
import { AtelierCard } from "./AtelierCard";
import { useAppStore, ChatMessage } from "../../store/useAppStore";
import { fetcher, poster } from "../../services/api";
import { AtelierTransactionCard } from "./AtelierTransactionCard";
import { formatCurrency, parseCurrency } from "../../utils/format";
import {
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { AtelierActionSheet } from "./AtelierActionSheet";
import { router } from "expo-router";
import { EditTransactionSheet } from "./EditTransactionSheet";
import { AtelierGlassView } from "./AtelierGlassView";
import { AtelierInsightChart } from "./AtelierInsightChart";
import { AtelierTokens } from "../../constants/AtelierTokens";
import { AtelierSpendingSummary } from "./AtelierSpendingSummary";
import { useAddTransaction, CreateTransactionRequest } from "../../hooks/useTransactions";
import { TransactionType } from "../../types/api";

const { height: screenHeight } = Dimensions.get("window");

interface AtelierAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtelierAI = ({ isOpen, onClose }: AtelierAIProps) => {
  const { messages, addMessage, activeWalletId } = useAppStore();
  const addTransactionMutation = useAddTransaction();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const editSheetRef = useRef<any>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Fetch proactive insights when opened
  useEffect(() => {
    if (!isOpen || !activeWalletId) return;

    const hasRecentInsight = messages.some(m =>
      m.id.startsWith("proactive-insight") &&
      Date.now() - m.timestamp < 300000 // 5 minutes
    );

    if (messages.length === 0 || !hasRecentInsight) {
      fetchProactiveInsight();
    }
  }, [isOpen, activeWalletId]);

  const fetchProactiveInsight = async () => {
    if (!activeWalletId) return;

    setIsProcessing(true);
    try {
      const comparison = await fetcher<any>(`/transactions/comparison?walletId=${activeWalletId}`);
      const aiResponse = await poster<any, any>("/ai/generate-insights", comparison);

      addMessage({
        id: "proactive-insight-" + Date.now(),
        role: "assistant",
        content: aiResponse.insight || "Chào bạn! Tôi đã sẵn sàng giúp bạn quản lý tài chính. Bạn có muốn xem phân tích chi tiêu tuần này không?",
        timestamp: Date.now(),
        hasSpendingSummary: !!aiResponse.summary,
        spendingData: aiResponse.summary ? {
          totalSpent: aiResponse.summary.total_expense || 0,
          budgetLimit: aiResponse.summary.budget_limit || 15000000,
          percentage: aiResponse.summary.percentage || 0,
        } : undefined,
        hasInsightChart: !!aiResponse.top_categories,
        insightData: aiResponse.top_categories || []
      });
    } catch (error) {
      console.error("Failed to fetch proactive insight", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput("");
    setIsProcessing(true);

    try {
      const queryResponse = await poster<any, any>("/ai/query-history", {
        text: userText,
        walletId: activeWalletId,
      });

      if (queryResponse.intent === "QUERY") {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: queryResponse.answer || "Đây là kết quả phân tích của bạn.",
          timestamp: Date.now(),
          hasQueryResult: true,
          queryData: {
            summary: queryResponse.summary || {},
            matchedTransactions: queryResponse.matchedTransactions || [],
            filters: queryResponse.filters || {},
          },
        };
        addMessage(aiMessage);
      } else {
        const response = await poster<any, any>("/ai/extract-transaction", {
          text: userText,
        });

        const hasData = response && response.amount > 0;

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: hasData
            ? `Đã xong! Tôi đã phân tích yêu cầu của bạn: "${userText}". Vui lòng xác nhận thông tin bên dưới.`
            : response?.message || "Tôi đã phân tích xong. Tôi có thể giúp gì thêm cho bạn?",
          timestamp: Date.now(),
          hasTransactionMatch: hasData,
          transactionData: hasData
            ? {
              amount: response.amount,
              category: response.category,
              type: response.type,
              date: response.date,
              note: response.note,
              confidence: response.confidence,
              categoryId: response.categoryId,
            }
            : undefined,
        };
        addMessage(aiMessage);
      }
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.message || "Xin lỗi, tôi đang gặp khó khăn khi xử lý yêu cầu này.";
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (data: any, messageId?: string) => {
    if (editSheetRef.current && 'open' in editSheetRef.current) {
      // Đính kèm messageId để biết Card nào cần cập nhật sau khi lưu
      (editSheetRef.current as any).open({ ...data, originalMessageId: messageId });
    }
  };

  const onSaveReview = async (formData: any) => {
    try {
      if (!formData.walletId && !activeWalletId) {
        Alert.alert("Lỗi", "Vui lòng chọn ví trước khi lưu.");
        return;
      }

      if (!formData.categoryId) {
        Alert.alert("Lỗi", "Vui lòng chọn danh mục cho giao dịch.");
        return;
      }

      const payload: CreateTransactionRequest = {
        walletId: formData.walletId || activeWalletId!,
        categoryId: formData.categoryId,
        amount: typeof formData.amount === 'string' ? parseCurrency(formData.amount) : Number(formData.amount),
        description: formData.description || formData.note || "Trích xuất bởi AI",
        type: formData.type as TransactionType,
        transactionDate: formData.transactionDate || new Date().toISOString(),
      };

      await addTransactionMutation.mutateAsync(payload);

      if (formData.originalMessageId) {
        const originalMsg = messages.find(m => m.id === formData.originalMessageId);
        if (originalMsg) {
          addMessage({
            ...originalMsg,
            isConfirmed: true,
            transactionData: {
              ...originalMsg.transactionData!,
              amount: payload.amount,
              categoryId: payload.categoryId,
              note: payload.description,
            }
          });
        }
      }

      addMessage({
        id: "confirm-" + Date.now(),
        role: "assistant",
        content: `✅ Đã lưu giao dịch: ${payload.description} (${formatCurrency(payload.amount)}) vào ví của bạn.`,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      const apiError = error.response?.data;
      Alert.alert("Lỗi Giao dịch", apiError?.message || "Không thể lưu giao dịch.");
      throw error;
    }
  };

  const handleSelectSource = (source: 'camera' | 'library') => {
    setIsSheetVisible(false);
    onClose();
    router.push({
      pathname: '/receipt/scanner',
      params: { source },
    });
  };

  // --- Render a Query Result Card inside chat ---
  const renderQueryResultCard = (data: ChatMessage["queryData"]) => {
    if (!data) return null;
    const { summary, matchedTransactions } = data;
    const totalExpense = summary?.total_expense || 0;
    const totalIncome = summary?.total_income || 0;
    const count = summary?.transaction_count || 0;
    const topCats: any[] = summary?.top_categories || [];

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.queryCard}
      >
        <View style={styles.queryStatsRow}>
          <View style={styles.queryStat}>
            <Text style={styles.queryStatLabel}>Tổng chi</Text>
            <Text style={[styles.queryStatValue, { color: "#D32F2F" }]}>{formatCurrency(totalExpense)}</Text>
          </View>
          <View style={styles.queryStatDivider} />
          <View style={styles.queryStat}>
            <Text style={styles.queryStatLabel}>Tổng thu</Text>
            <Text style={[styles.queryStatValue, { color: "#2E7D32" }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.queryStatDivider} />
          <View style={styles.queryStat}>
            <Text style={styles.queryStatLabel}>Giao dịch</Text>
            <Text style={[styles.queryStatValue, { color: "#003d9b" }]}>{count}</Text>
          </View>
        </View>

        {topCats.length > 0 && (
          <View style={styles.topCategoriesSection}>
            <Text style={styles.topCatTitle}>Danh mục chi tiêu cao nhất</Text>
            <AtelierInsightChart type="pie" data={topCats} />
          </View>
        )}

        {matchedTransactions && matchedTransactions.length > 0 && (
          <View style={styles.matchedSection}>
            <Text style={styles.matchedTitle}>Giao dịch gần đây</Text>
            {matchedTransactions.slice(0, 3).map((txn: any, i: number) => (
              <TouchableOpacity 
                key={txn.id || i} 
                style={styles.miniTxnRow}
                onPress={() => handleEdit({
                  id: txn.id,
                  amount: txn.amount,
                  category: txn.categoryName,
                  categoryId: txn.categoryId,
                  type: txn.type,
                  date: txn.transactionDate,
                  note: txn.description,
                  walletId: txn.walletId
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniTxnDesc} numberOfLines={1}>{txn.description || "Giao dịch"}</Text>
                  <Text style={styles.miniTxnDate}>{txn.transactionDate?.split("T")[0]}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text style={[styles.miniTxnAmount, { color: txn.type === "INCOME" ? "#2E7D32" : "#D32F2F" }]}>
                    {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </Text>
                  <Edit3 size={12} color="#717785" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </MotiView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <BottomSheetModalProvider>
        <View style={styles.modalContainer}>
          <AnimatePresence>
            {isOpen && (
              <MotiView
                from={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 50 }}
                className="flex-1"
              >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-2xl bg-ai-primary items-center justify-center shadow-lg shadow-ai-primary/30">
                      <Sparkles size={20} color="white" />
                    </View>
                    <View>
                      <AtelierTypography variant="h3" className="text-white">Atelier AI</AtelierTypography>
                      <AtelierTypography variant="caption" className="text-white/60">Assistant thông minh</AtelierTypography>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Chat Content */}
                <ScrollView 
                  ref={scrollViewRef}
                  className="flex-1 px-4"
                  contentContainerStyle={{ paddingBottom: 100 }}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.map((msg, index) => (
                    <MotiView
                      key={msg.id}
                      from={{ opacity: 0, translateX: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: index * 100 }}
                      className={`mb-6 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <View 
                        className={`max-w-[85%] px-4 py-3 rounded-3xl ${
                          msg.role === 'user' 
                            ? 'bg-ai-primary rounded-tr-none shadow-sm shadow-ai-primary/20' 
                            : 'bg-white rounded-tl-none shadow-sm shadow-black/5'
                        }`}
                      >
                        <AtelierTypography 
                          variant="body" 
                          className={msg.role === 'user' ? 'text-white' : 'text-surface-on'}
                        >
                          {msg.content}
                        </AtelierTypography>
                      </View>
                      
                      {msg.hasSpendingSummary && msg.spendingData && (
                        <AtelierSpendingSummary 
                          totalSpent={msg.spendingData.totalSpent}
                          budgetLimit={msg.spendingData.budgetLimit}
                          percentage={msg.spendingData.percentage}
                        />
                      )}
                      
                      {msg.hasInsightChart && msg.insightData && (
                        <AtelierInsightChart type="pie" data={msg.insightData} />
                      )}

                      {msg.hasQueryResult && msg.queryData && renderQueryResultCard(msg.queryData)}

                      {msg.hasTransactionMatch && msg.transactionData && (
                        <MotiView
                          from={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full mt-4"
                        >
                          <AtelierTransactionCard
                            variant="bubble"
                            data={msg.transactionData}
                            onConfirm={async () => {
                              const data = msg.transactionData;
                              if (!data) return;

                              const walletId = useAppStore.getState().activeWalletId;
                              if (!walletId) {
                                Alert.alert("Yêu cầu chọn Ví", "Vui lòng chọn một ví từ màn hình chính trước khi xác nhận.");
                                return;
                              }

                              if (!data.categoryId) {
                                Alert.alert("Thiếu thông tin", "Giao dịch này chưa có danh mục. Vui lòng nhấn 'Sửa chi tiết' để chọn danh mục.");
                                return;
                              }

                              if (addTransactionMutation.isPending) return;

                              try {
                                const payload: CreateTransactionRequest = {
                                  walletId: walletId,
                                  categoryId: data.categoryId!,
                                  amount: typeof data.amount === 'string' ? parseCurrency(data.amount) : Number(data.amount),
                                  description: data.note || "Trích xuất bởi AI",
                                  type: data.type as TransactionType,
                                  transactionDate: new Date().toISOString(),
                                };

                                await addTransactionMutation.mutateAsync(payload);

                                addMessage({
                                  ...msg,
                                  isConfirmed: true
                                });

                                addMessage({
                                  id: "confirm-" + Date.now(),
                                  role: "assistant",
                                  content: `✅ Đã lưu giao dịch: ${payload.description} (${formatCurrency(payload.amount)}) vào ví của bạn.`,
                                  timestamp: Date.now(),
                                });

                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              } catch (error: any) {
                                const apiError = error.response?.data;
                                const errorMessage = apiError?.message || "Không thể lưu giao dịch. Vui lòng thử lại.";
                                Alert.alert("Lỗi Giao dịch", errorMessage);
                              }
                            }}
                            onEdit={() => handleEdit(msg.transactionData, msg.id)}
                            isPending={addTransactionMutation.isPending}
                            isConfirmed={msg.isConfirmed}
                          />
                        </MotiView>
                      )}
                    </MotiView>
                  ))}
                  
                  {isProcessing && (
                    <MotiView 
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-row items-center gap-2 px-4 py-2"
                    >
                      <ActivityIndicator size="small" color="white" />
                      <AtelierTypography variant="caption" className="text-white/60">Atelier đang xử lý...</AtelierTypography>
                    </MotiView>
                  )}
                </ScrollView>

                {/* Input Area */}
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                  className="p-4"
                >
                  <AtelierGlassView 
                    intensity={20}
                    className="rounded-[32px] overflow-hidden border border-white/20"
                  >
                    <View className="flex-row items-center px-2 py-2">
                      <TouchableOpacity 
                        onPress={() => setIsSheetVisible(true)}
                        className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center ml-1"
                      >
                        <Plus size={20} color="white" />
                      </TouchableOpacity>
                      
                      <View className="flex-1 px-3">
                        <TextInput
                          value={input}
                          onChangeText={setInput}
                          placeholder="Nhập yêu cầu của bạn..."
                          placeholderTextColor="rgba(255,255,255,0.5)"
                          className="text-white font-inter font-medium text-[15px] py-2"
                          multiline
                        />
                        <TouchableOpacity 
                          onPress={handleSend}
                          disabled={isProcessing}
                          className="absolute right-1.5 top-1.5 w-9 h-9 rounded-xl overflow-hidden items-center justify-center"
                        >
                          <LinearGradient
                            colors={['#005ab4', '#003d9b']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="absolute inset-0"
                          />
                          {isProcessing ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <ArrowUp size={18} color="white" strokeWidth={2.5} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </AtelierGlassView>
                </KeyboardAvoidingView>
              </MotiView>
            )}
          </AnimatePresence>

          <EditTransactionSheet
            ref={editSheetRef}
            onSave={onSaveReview}
          />
          <AtelierActionSheet
            isVisible={isSheetVisible}
            onClose={() => setIsSheetVisible(false)}
            onSelectCamera={() => handleSelectSource('camera')}
            onSelectGallery={() => handleSelectSource('library')}
          />
        </View>
      </BottomSheetModalProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
  },
  queryCard: {
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 20,
    width: '100%',
  },
  queryStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  queryStat: {
    flex: 1,
    alignItems: "center",
  },
  queryStatLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#717785",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  queryStatValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  queryStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  topCategoriesSection: {
    paddingTop: 12,
    marginBottom: 12,
  },
  topCatTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#414753",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  matchedSection: {
    paddingTop: 12,
  },
  matchedTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#414753",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  miniTxnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  miniTxnDesc: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  miniTxnDate: {
    fontSize: 10,
    color: "#717785",
    marginTop: 2,
  },
  miniTxnAmount: {
    fontSize: 14,
    fontWeight: "800",
  },
});
