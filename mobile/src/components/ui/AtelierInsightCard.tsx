import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, TrendingUp, TrendingDown, ChevronRight } from "lucide-react-native";
import { formatCurrency } from "../../utils/format";

interface InsightProps {
  type: "weekly" | "monthly";
  current: number;
  previous: number;
  aiInsight?: string;
  onPress?: () => void;
}

export const AtelierInsightCard: React.FC<InsightProps> = ({ 
  type, 
  current, 
  previous, 
  aiInsight,
  onPress 
}) => {
  const diff = current - previous;
  const isIncrease = diff > 0;
  const percentChange = previous > 0 ? Math.abs((diff / previous) * 100).toFixed(1) : "0";
  
  const title = type === "weekly" ? "Tóm tắt tuần này" : "Tóm tắt tháng này";
  const subtitle = type === "weekly" ? "So với tuần trước" : "So với tháng trước";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 800 }}
      className="mb-6"
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={onPress}
        className="overflow-hidden rounded-[24px]"
      >
        <LinearGradient
          colors={["#f0f4ff", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 border border-primary/10"
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <View className="bg-primary/10 p-2 rounded-full">
                <Sparkles size={16} color="#1275e2" />
              </View>
              <View>
                <Text className="font-manrope font-bold text-neutral-900 text-base">{title}</Text>
                <Text className="font-inter font-medium text-neutral-500 text-xs">{subtitle}</Text>
              </View>
            </View>
            <View className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${isIncrease ? 'bg-error/10' : 'bg-green-100'}`}>
              {isIncrease ? (
                <TrendingUp size={12} color="#ef4444" />
              ) : (
                <TrendingDown size={12} color="#22c55e" />
              )}
              <Text className={`font-bold text-xs ${isIncrease ? 'text-error' : 'text-green-600'}`}>
                {percentChange}%
              </Text>
            </View>
          </View>

          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-neutral-500 text-xs mb-1">Đã chi tiêu</Text>
              <Text className="font-manrope font-extrabold text-xl text-neutral-900">
                {formatCurrency(current)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-primary font-bold text-sm">Hỏi AI</Text>
              <ChevronRight size={16} color="#1275e2" />
            </View>
          </View>

          {aiInsight && (
            <View className="mt-4 pt-3 border-t border-primary/5">
              <Text className="font-inter italic text-neutral-600 text-[13px] leading-relaxed">
                {aiInsight}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
};
