import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert, Text, Modal } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { X, Bolt, Sparkles, Coffee, ArrowUp, Camera, Mic, Search, TrendingUp, AlertTriangle } from "lucide-react-native";
import { AtelierTypography } from "./AtelierTypography";
import { AtelierCard } from "./AtelierCard";
import { useAppStore, ChatMessage } from "../../store/useAppStore";
import { fetcher, poster } from "../../services/api";
import { AtelierTransactionCard } from "./AtelierTransactionCard";
import { formatCurrency } from "../../utils/format";
import { AtelierActionSheet } from "./AtelierActionSheet";
import { router } from "expo-router";
import { ManualTransactionModal } from "../../features/transactions/ManualTransactionModal";
import { CompactReviewSheet } from "./CompactReviewSheet";

const { height: screenHeight } = Dimensions.get("window");

interface AtelierAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtelierAI = ({ isOpen, onClose }: AtelierAIProps) => {
  const { messages, addMessage, updateLastMessage, activeWalletId } = useAppStore();
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedTxData, setSelectedTxData] = useState<any>(null);

  // Fetch proactive insights when opened
  useEffect(() => {
    // Luôn fetch insight khi mở modal nếu chưa có tin nhắn nào hoặc tin nhắn cuối không phải là insight gần đây
    const shouldFetch = isOpen && activeWalletId && (
      messages.length === 0 || 
      !messages.some(m => m.id.startsWith("proactive-insight"))
    );

    if (shouldFetch) {
      fetchProactiveInsight();
    }
  }, [isOpen, activeWalletId]);

  const fetchProactiveInsight = async () => {
    setIsProcessing(true);
    try {
      const comparison = await fetcher<any>(`/transactions/comparison?walletId=${activeWalletId}`);
      const aiResponse = await poster<any, any>("/ai/generate-insights", comparison);

      addMessage({
        id: "proactive-insight-" + Date.now(),
        role: "assistant",
        content: aiResponse.insight || "Chào bạn! Tôi đã sẵn sàng giúp bạn quản lý tài chính. Bạn có muốn xem phân tích chi tiêu tuần này không?",
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch proactive insight", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userText = inputText.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInputText("");
    setIsProcessing(true);

    try {
      // First, try the smart query endpoint to classify intent
      const queryResponse = await poster<any, any>("/ai/query-history", {
        text: userText,
        walletId: activeWalletId,
      });

      if (queryResponse.intent === "QUERY") {
        // --- QUERY INTENT: Show history analysis ---
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
        // --- COMMAND INTENT: Existing extraction flow ---
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
          hasCard: hasData,
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
      const errorMessage =
        apiError?.message || "Xin lỗi, tôi đang gặp khó khăn khi xử lý yêu cầu này.";
      const suggestion = apiError?.suggestion;

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: suggestion ? `${errorMessage}\n\n💡 Gợi ý: ${suggestion}` : errorMessage,
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  // Phase 1.3: ActionSheet handlers
  const handleClose = () => {
    setIsSheetVisible(false);
    onClose();
  };

  const handleEdit = (data: any) => {
    setSelectedTxData(data);
    setIsReviewModalVisible(true);
  };

  const onSaveReview = async (formData: any) => {
    try {
      if (!activeWalletId) {
        Alert.alert("Lỗi", "Vui lòng chọn ví trước khi lưu.");
        return;
      }

      await poster("/transactions", {
        ...formData,
        walletId: activeWalletId,
        description: formData.note || "Trích xuất bởi AI",
      });

      // Thêm tin nhắn xác nhận vào chat
      addMessage({
        id: "confirm-" + Date.now(),
        role: "assistant",
        content: `✅ Đã lưu giao dịch: ${formData.note || "Giao dịch mới"} (${formatCurrency(formData.amount)}) vào ví của bạn.`,
        timestamp: Date.now(),
      });
      
      setIsReviewModalVisible(false);
    } catch (error: any) {
      const apiError = error.response?.data;
      Alert.alert("Lỗi Giao dịch", apiError?.message || "Không thể lưu giao dịch.");
    }
  };

  const handleCameraPress = () => {
    setIsSheetVisible(true);
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
        transition={{ type: "spring", delay: 200, damping: 20 }}
        style={styles.queryCard}
      >
        {/* Summary Stats */}
        <View style={styles.queryStatsRow}>
          <View style={styles.queryStat}>
            <Text style={styles.queryStatLabel}>Tổng chi</Text>
            <Text style={[styles.queryStatValue, { color: "#D32F2F" }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
          <View style={styles.queryStatDivider} />
          <View style={styles.queryStat}>
            <Text style={styles.queryStatLabel}>Tổng thu</Text>
            <Text style={[styles.queryStatValue, { color: "#2E7D32" }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.queryStatDivider} />
          <View style={styles.queryStat}>
            <Text style={styles.queryStatLabel}>Giao dịch</Text>
            <Text style={[styles.queryStatValue, { color: "#005ab4" }]}>{count}</Text>
          </View>
        </View>

        {/* Top Categories */}
        {topCats.length > 0 && (
          <View style={styles.topCategoriesSection}>
            <Text style={styles.topCatTitle}>Danh mục chi tiêu cao nhất</Text>
            {topCats.slice(0, 3).map((cat: any, i: number) => (
              <View key={i} style={styles.topCatRow}>
                <View style={styles.topCatDot} />
                <Text style={styles.topCatName}>{cat.category}</Text>
                <Text style={styles.topCatAmount}>{formatCurrency(cat.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Matched Transactions preview */}
        {matchedTransactions && matchedTransactions.length > 0 && (
          <View style={styles.matchedSection}>
            <Text style={styles.matchedTitle}>
              Giao dịch gần đây ({matchedTransactions.length})
            </Text>
            {matchedTransactions.slice(0, 3).map((txn: any, i: number) => (
              <View key={txn.id || i} style={styles.miniTxnRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniTxnDesc} numberOfLines={1}>
                    {txn.categoryName || txn.description || "Giao dịch"}
                  </Text>
                  <Text style={styles.miniTxnDate}>
                    {txn.transactionDate?.split("T")[0] || ""}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.miniTxnAmount,
                    { color: txn.type === "INCOME" ? "#2E7D32" : "#D32F2F" },
                  ]}
                >
                  {txn.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </MotiView>
    );
  };

  const [isModalMounted, setIsModalMounted] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setIsModalMounted(true);
    } else {
      const timer = setTimeout(() => setIsModalMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
    <Modal transparent visible={isModalMounted} animationType="none" onRequestClose={handleClose}>
    <AnimatePresence>
      {isOpen && (
        <View key="atelier-ai-modal" style={styles.absoluteLayer} pointerEvents="box-none">
          {/* Backdrop */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onTouchStart={handleClose}
          />

          {/* Bottom Sheet */}
          <MotiView
            from={{ translateY: screenHeight }}
            animate={{ translateY: 0 }}
            exit={{ translateY: screenHeight }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[40px] shadow-2xl"
            style={{ height: screenHeight * 0.85 }}
          >
            {/* Handle */}
            <View className="items-center py-4">
              <View className="w-12 h-1.5 bg-surface-container rounded-full opacity-30" />
            </View>

            {/* Header */}
            <View className="px-8 pb-4 flex-row justify-between items-center border-b border-surface-container/50">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
                  <Bolt size={24} color="white" fill="white" />
                </View>
                <View>
                  <AtelierTypography variant="h3" className="text-xl">Atelier AI</AtelierTypography>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-surface-container/50 items-center justify-center">
                <X size={20} color="#717785" />
              </TouchableOpacity>
            </View>

            {/* Chat Content */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
              <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 && isProcessing && (
                  <View className="items-center py-12">
                    <ActivityIndicator size="large" color="#005ab4" />
                    <AtelierTypography variant="label" className="mt-4">Đang phân tích dữ liệu chi tiêu...</AtelierTypography>
                  </View>
                )}
                {messages.length === 0 && !isProcessing && (
                  <View className="items-center py-12 opacity-50">
                    <Sparkles size={40} color="#005ab4" />
                    <AtelierTypography variant="body" className="mt-4 text-center">
                      Welcome! I'm your Financial Atelier AI.{"\n"}Ask me anything about your money.
                    </AtelierTypography>
                  </View>
                )}
                {messages.map((msg, index) => (
                  <MotiView
                    key={`msg-${msg.id}-${index}`}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    className={`mb-6 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <View className={`flex-row gap-3 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse self-end" : "self-start"}`}>
                      {msg.role === "assistant" && (
                        <View className="w-8 h-8 rounded-xl bg-primary-container items-center justify-center self-start mt-1">
                          <Sparkles size={14} color="white" fill="white" />
                        </View>
                      )}
                      <View className={`flex-shrink ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <View className={`px-5 py-4 rounded-[24px] ${msg.role === "user"
                          ? "bg-primary rounded-br-none"
                          : "bg-surface-container-lowest border border-surface-container rounded-tl-none"
                          }`}>
                          <AtelierTypography
                            variant="body"
                            className={msg.role === "user" ? "text-white" : "text-surface-on"}
                          >
                            {msg.content}
                          </AtelierTypography>
                        </View>

                        {/* Transaction extraction card */}
                        {msg.hasCard && msg.transactionData && (
                          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 300 }}>
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

                                try {
                                  await poster("/transactions", {
                                    walletId: walletId,
                                    amount: data.amount,
                                    description: data.note || "Trích xuất bởi AI",
                                    type: data.type,
                                    transactionDate: new Date().toISOString().split('.')[0],
                                    categoryId: data.categoryId || null
                                  });
                                  Alert.alert("Thành công", "Giao dịch đã được ghi lại!");
                                } catch (error: any) {
                                  const apiError = error.response?.data;
                                  const errorMessage = apiError?.message || "Không thể lưu giao dịch. Vui lòng thử lại.";
                                  Alert.alert("Lỗi Giao dịch", errorMessage);
                                }
                              }}
                              onEdit={() => handleEdit(msg.transactionData)}
                            />
                          </MotiView>
                        )}

                        {/* Query result card (NEW) */}
                        {msg.hasQueryResult && msg.queryData && renderQueryResultCard(msg.queryData)}
                      </View>
                    </View>
                  </MotiView>
                ))}
              </ScrollView>

              <View className="px-6 pb-12 pt-4 bg-white/80 border-t border-surface-container">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  {["Phân tích xu hướng", "Tháng này chi bao nhiêu?", "Giao dịch lớn nhất?"].map((chip, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setInputText(chip)}
                      className="px-5 py-2.5 bg-white border border-surface-container rounded-full mr-2 shadow-sm"
                    >
                      <AtelierTypography variant="label" className="text-[11px] normal-case">{chip}</AtelierTypography>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={handleCameraPress}
                    className="w-12 h-12 bg-white border border-surface-container rounded-2xl items-center justify-center shadow-sm"
                  >
                    <Camera size={20} color="#005ab4" />
                  </TouchableOpacity>
                  <View className="flex-1 relative">
                    <TextInput
                      placeholder="Hỏi về tài chính của bạn..."
                      value={inputText}
                      onChangeText={setInputText}
                      onSubmitEditing={handleSend}
                      className="bg-surface-container/30 py-4 pl-5 pr-12 rounded-2xl text-surface-on font-inter"
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={isProcessing}
                      className="absolute right-2 top-2 w-8 h-8 bg-primary rounded-xl items-center justify-center shadow-lg"
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <ArrowUp size={16} color="white" />
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
    </Modal>
    <CompactReviewSheet
      isVisible={isReviewModalVisible}
      onClose={() => setIsReviewModalVisible(false)}
      onSave={onSaveReview}
      initialData={selectedTxData}
    />
    <AtelierActionSheet
      isVisible={isSheetVisible}
      onClose={() => setIsSheetVisible(false)}
      onSelectCamera={() => handleSelectSource('camera')}
      onSelectGallery={() => handleSelectSource('library')}
    />
    </>
  );
};

const styles = StyleSheet.create({
  absoluteLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  // Query Result Card styles
  queryCard: {
    marginTop: 12,
    backgroundColor: "#F8FAFE",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 90, 180, 0.1)",
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
    fontSize: 10,
    fontWeight: "700",
    color: "#717785",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  queryStatValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  queryStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(0, 90, 180, 0.1)",
  },
  topCategoriesSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 90, 180, 0.08)",
    paddingTop: 12,
    marginBottom: 12,
  },
  topCatTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#414753",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  topCatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  topCatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#005ab4",
    marginRight: 8,
  },
  topCatName: {
    flex: 1,
    fontSize: 13,
    color: "#414753",
    fontWeight: "500",
  },
  topCatAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D32F2F",
  },
  matchedSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 90, 180, 0.08)",
    paddingTop: 12,
  },
  matchedTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#414753",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  miniTxnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
    marginLeft: 12,
  },
});
