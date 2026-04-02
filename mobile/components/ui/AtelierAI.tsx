import React, { useState, useCallback, useRef } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { X, Bolt, Sparkles, Coffee, ArrowUp, Camera, Mic } from "lucide-react-native";
import { AtelierTypography } from "./AtelierTypography";
import { AtelierCard } from "./AtelierCard";
import { useAppStore, ChatMessage } from "../../store/useAppStore";
import { poster } from "../../services/api";

const { height: screenHeight } = Dimensions.get("window");

interface AtelierAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtelierAI = ({ isOpen, onClose }: AtelierAIProps) => {
  const { messages, addMessage, updateLastMessage } = useAppStore();
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInputText("");
    setIsProcessing(true);

    try {
      // Giả lập hoặc gọi API NLP thật từ Backend
      const response = await poster<any, any>("/ai/extract-transaction", { 
        text: userMessage.content 
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response?.message || `I've analyzed your request: "${userMessage.content}". How can I help further?`,
        timestamp: Date.now(),
      };
      addMessage(aiMessage);
    } catch (error) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble processing that right now. Please try again.",
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <View style={styles.absoluteLayer} pointerEvents="box-none">
          {/* Backdrop */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onTouchStart={onClose}
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
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-secondary" />
                    <AtelierTypography variant="label" className="text-[10px] text-secondary">PREMIUM CONCIERGE</AtelierTypography>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-surface-container/50 items-center justify-center">
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
                {messages.length === 0 && (
                  <View className="items-center py-12 opacity-50">
                    <Sparkles size={40} color="#005ab4" />
                    <AtelierTypography variant="body" className="mt-4 text-center">
                      Welcome! I'm your Financial Atelier AI.{"\n"}Ask me anything about your money.
                    </AtelierTypography>
                  </View>
                )}
                {messages.map((msg) => (
                  <MotiView 
                    key={msg.id}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    className={`mb-6 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <View className="flex-row gap-3 max-w-[90%]">
                      {msg.role === "assistant" && (
                        <View className="w-8 h-8 rounded-xl bg-primary-container items-center justify-center self-start mt-1">
                          <Sparkles size={14} color="white" fill="white" />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className={`px-5 py-4 rounded-[24px] ${
                          msg.role === "user" 
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

                        {msg.hasCard && (
                          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 300 }}>
                            <AtelierCard elevation="lowest" padding="md" className="mt-4 bg-surface-container/20 border border-surface-container">
// ... (Card content remains same)
                            </AtelierCard>
                          </MotiView>
                        )}
                      </View>
                    </View>
                  </MotiView>
                ))}
              </ScrollView>

              <View className="px-6 pb-12 pt-4 bg-white/80 border-t border-surface-container">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  {["Trend analysis", "Savings goal", "Scan receipt"].map((chip, i) => (
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
                   <TouchableOpacity className="w-12 h-12 bg-white border border-surface-container rounded-2xl items-center justify-center shadow-sm">
                      <Camera size={20} color="#005ab4" />
                   </TouchableOpacity>
                   <View className="flex-1 relative">
                      <TextInput 
                        placeholder="Ask about your finances..." 
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
});
