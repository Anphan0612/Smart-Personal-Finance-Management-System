import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MotiView } from 'moti';
import { AlertTriangle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  categoryName: string;
  percentageUsed: number;
  overspentAmount: number;
  aiInsight: string;
}

export function BudgetAlertModal({
  visible,
  onDismiss,
  categoryName,
  percentageUsed,
  overspentAmount,
  aiInsight,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <MotiView
          from={{ translateY: 300, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 18 }}
        >
          <LinearGradient
            colors={['#fef2f2', '#ffffff']}
            className="rounded-t-[32px] px-6 pt-6 pb-10"
          >
            <View className="flex-row justify-end mb-2">
              <TouchableOpacity
                onPress={onDismiss}
                className="w-8 h-8 rounded-full bg-neutral-100 items-center justify-center"
              >
                <X size={16} color="#74777f" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 200 }}
              >
                <View className="w-20 h-20 rounded-full bg-error/10 items-center justify-center mb-4">
                  <AlertTriangle size={40} color="#ef4444" />
                </View>
              </MotiView>
              <Text className="font-manrope font-extrabold text-2xl text-error text-center">
                Cảnh báo ngân sách!
              </Text>
              <Text className="text-neutral-500 font-medium text-sm text-center mt-1">
                {categoryName} • Đã dùng {percentageUsed.toFixed(0)}%
              </Text>
            </View>

            <View className="bg-error/5 border border-error/10 rounded-[20px] p-5 mb-6">
              <Text className="text-neutral-900 font-medium text-[14px] leading-6 text-center">
                {aiInsight}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onDismiss}
              className="bg-error py-4 rounded-full items-center"
            >
              <Text className="text-white font-bold text-base">Tôi đã hiểu</Text>
            </TouchableOpacity>
          </LinearGradient>
        </MotiView>
      </View>
    </Modal>
  );
}
