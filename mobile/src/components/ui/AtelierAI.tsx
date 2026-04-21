import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { MotiView } from "moti";
import { Sparkles, X, Camera, ArrowUp } from "lucide-react-native";
import { AtelierTypography } from "./AtelierTypography";
import { AtelierTransactionCard } from "./AtelierTransactionCard";
import { Colors } from "@/constants/tokens";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  hasCard?: boolean;
  transactionData?: any;
}

export const AtelierAI = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    // Mock AI Response with transaction card
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: "Tôi thấy bạn vừa đi cà phê. Tôi đã chuẩn bị giao dịch này cho bạn:",
        hasCard: true,
        transactionData: {
          amount: 45000,
          category: "Coffee & Drinks",
          type: "EXPENSE",
          date: "Hôm nay",
          note: "Highlands Coffee",
          confidence: 0.95
        }
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={StyleSheet.absoluteFill}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose} 
          style={styles.backdrop} 
        />
        
        <MotiView
          from={{ translateY: 1000 }}
          animate={{ translateY: 0 }}
          exit={{ translateY: 1000 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="flex-1 mt-20 bg-white rounded-t-[40px] overflow-hidden"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View className="px-6 py-4 border-b border-neutral-100 flex-row justify-between items-center bg-white">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                  <Sparkles size={16} color={Colors.primary.DEFAULT} />
                </View>
                <AtelierTypography variant="h3">Atelier AI</AtelierTypography>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-neutral-50 items-center justify-center"
              >
                <X size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
              {messages.map((msg, idx) => (
                <MotiView
                  key={idx}
                  from={{ opacity: 0, translateX: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  className={`mb-6 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <View className={`flex-row gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "assistant" && (
                      <View 
                        className="w-8 h-8 rounded-xl items-center justify-center self-start mt-1"
                        style={{ backgroundColor: Colors.primary.DEFAULT }}
                      >
                        <Sparkles size={14} color="white" />
                      </View>
                    )}
                    <View className="flex-1" style={{ maxWidth: "85%" }}>
                      <View className={`px-5 py-3 rounded-[24px] ${
                        msg.role === "user"
                          ? "rounded-br-none"
                          : "bg-neutral-50 rounded-tl-none border border-neutral-100"
                      }`}
                      style={msg.role === "user" ? { backgroundColor: Colors.primary.DEFAULT } : {}}
                      >
                        <AtelierTypography
                          variant="body"
                          color={msg.role === "user" ? "white" : undefined}
                        >
                          {msg.content}
                        </AtelierTypography>
                      </View>

                      {msg.hasCard && msg.transactionData && (
                        <View className="mt-4">
                          <AtelierTransactionCard
                            data={msg.transactionData}
                            onConfirm={() => Alert.alert("Xác nhận", "Giao dịch đã được ghi nhận!")}
                            onEdit={() => Alert.alert("Chỉnh sửa", "Chuyển đến màn hình chỉnh sửa...")}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </MotiView>
              ))}
              {isProcessing && (
                <MotiView 
                  from={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex-row items-center gap-2 mb-6"
                >
                  <View 
                    className="w-8 h-8 rounded-xl items-center justify-center"
                    style={{ backgroundColor: Colors.primary.DEFAULT }}
                  >
                    <Sparkles size={14} color="white" />
                  </View>
                  <View className="bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-100">
                    <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
                  </View>
                </MotiView>
              )}
            </ScrollView>

            <View className="px-6 pb-12 pt-4 border-t border-neutral-100 bg-white">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity 
                   className="w-12 h-12 bg-neutral-50 rounded-2xl items-center justify-center border border-neutral-100"
                >
                  <Camera size={20} color={Colors.primary.DEFAULT} />
                </TouchableOpacity>
                <View className="flex-1 relative">
                  <TextInput
                    placeholder="Hỏi về tài chính của bạn..."
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSend}
                    className="bg-neutral-50 py-3.5 pl-5 pr-12 rounded-2xl text-neutral-900 font-inter border border-neutral-100"
                    placeholderTextColor={Colors.neutral[400]}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={isProcessing}
                    className="absolute right-2 top-2 w-8 h-8 rounded-xl items-center justify-center shadow-lg"
                    style={{ backgroundColor: Colors.primary.DEFAULT, opacity: isProcessing ? 0.6 : 1 }}
                  >
                    <ArrowUp size={16} color="white" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </MotiView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
