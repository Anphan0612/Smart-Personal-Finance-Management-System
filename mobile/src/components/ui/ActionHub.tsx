import React from 'react';
import { View, Modal, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Sparkles, Settings, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Colors } from '../../constants/tokens';
import { AtelierTokens } from '../../constants/AtelierTokens';
import { AtelierTypography } from './AtelierTypography';

interface ActionHubProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: () => void;
  onAskAI: () => void;
  onManage: () => void;
  tabBarHeight: number;
}

export const ActionHub: React.FC<ActionHubProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onAskAI,
  onManage,
  tabBarHeight,
}) => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = 360; // Increased for better spacing

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* Bottom Sheet - Using NativeWind for standard styling */}
      <MotiView
        from={{ translateY: sheetHeight }}
        animate={{ translateY: 0 }}
        transition={{ type: 'spring', damping: 15, mass: 1 }}
        className="absolute left-0 right-0 bg-white rounded-t-[40px] px-6 pt-3 shadow-2xl"
        style={{
          bottom: tabBarHeight,
          maxHeight: screenHeight - 100,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Handle Bar */}
        <View className="items-center py-2">
          <View className="w-10 h-1 bg-neutral-200 rounded-full" />
        </View>

        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <View>
            <AtelierTypography variant="h2" className="text-neutral-900">
              Công cụ Atelier
            </AtelierTypography>
            <AtelierTypography variant="caption" className="text-neutral-400">
              Chọn hành động bạn muốn thực hiện
            </AtelierTypography>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
          >
            <X size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>
        </View>

        {/* Action Items List */}
        <View className="gap-4">
          <ActionItem
            icon={<Plus size={24} color={Colors.primary.DEFAULT} />}
            label="Thêm giao dịch"
            subtitle="Ghi lại chi tiêu hoặc thu nhập mới"
            onPress={() => {
              onAddTransaction();
              onClose();
            }}
            delay={100}
            iconBg="bg-blue-50"
          />

          <ActionItem
            icon={<Sparkles size={24} color="#8b5cf6" />}
            label="Hỏi Atelier AI"
            subtitle="Nhận lời khuyên và phân tích tài chính"
            onPress={() => {
              onAskAI();
              onClose();
            }}
            delay={200}
            iconBg="bg-purple-50"
          />

          <ActionItem
            icon={<Settings size={24} color={Colors.neutral[500]} />}
            label="Cài đặt & Quản lý"
            subtitle="Tùy chỉnh danh mục và tài khoản"
            onPress={() => {
              onManage();
              onClose();
            }}
            delay={300}
            iconBg="bg-neutral-50"
          />
        </View>

        {/* Footer Spacing */}
        <View className="h-4" />
      </MotiView>
    </Modal>
  );
};

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  delay: number;
  iconBg?: string;
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  delay,
  iconBg = 'bg-primary/5',
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
        delay,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center p-4 rounded-[28px] bg-white border border-neutral-50 shadow-sm"
      >
        <View className={`w-14 h-14 ${iconBg} rounded-2xl items-center justify-center mr-4`}>
          {icon}
        </View>
        <View className="flex-1">
          <AtelierTypography variant="h3" className="text-[17px] mb-0.5 text-neutral-900">
            {label}
          </AtelierTypography>
          <AtelierTypography variant="caption" className="text-neutral-400">
            {subtitle}
          </AtelierTypography>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};
