import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { X } from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { Colors } from '@/constants/tokens';
import { getIconFromName, CATEGORY_ICONS } from '@/constants/icon-map';
import * as Haptics from 'expo-haptics';

interface CategoryCreationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (name: string, iconName: string, type: 'EXPENSE' | 'INCOME') => Promise<void>;
  transactionType: 'EXPENSE' | 'INCOME';
}

export const CategoryCreationModal = ({
  isVisible,
  onClose,
  onSubmit,
  transactionType,
}: CategoryCreationModalProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(CATEGORY_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên danh mục');
      return;
    }

    if (!selectedIcon) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn biểu tượng');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(categoryName.trim(), selectedIcon, transactionType);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCategoryName('');
      setSelectedIcon(CATEGORY_ICONS[0]);
      onClose();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Lỗi', error?.message || 'Không thể tạo danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <AnimatePresence>
        {isVisible && (
          <View className="flex-1 justify-center items-center">
            {/* Backdrop */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/40"
              onTouchStart={onClose}
            />

            {/* Modal Content */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-[32px] mx-6 p-8 shadow-2xl"
              style={{ maxWidth: 400, width: '90%' }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <AtelierTypography variant="h3" className="text-xl text-neutral-900">
                  Tạo danh mục mới
                </AtelierTypography>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center"
                >
                  <X size={16} color={Colors.neutral[900]} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Category Name Input */}
              <View className="mb-6">
                <AtelierTypography variant="label" className="text-neutral-400 mb-2 tracking-[1px]">
                  TÊN DANH MỤC
                </AtelierTypography>
                <TextInput
                  className="bg-surface-container-low rounded-2xl px-4 h-14 text-neutral-900 font-body text-base border border-neutral-100"
                  placeholder="Ví dụ: Ăn uống, Lương..."
                  placeholderTextColor={Colors.neutral[400]}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  autoFocus
                />
              </View>

              {/* Icon Selection */}
              <View className="mb-6">
                <AtelierTypography variant="label" className="text-neutral-400 mb-3 tracking-[1px]">
                  CHỌN BIỂU TƯỢNG
                </AtelierTypography>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                  contentContainerStyle={{ gap: 12 }}
                >
                  {CATEGORY_ICONS.map((iconName) => {
                    const Icon = getIconFromName(iconName);
                    const isSelected = selectedIcon === iconName;

                    return (
                      <TouchableOpacity
                        key={iconName}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedIcon(iconName);
                        }}
                        activeOpacity={0.8}
                      >
                        <MotiView
                          animate={{
                            backgroundColor: isSelected ? Colors.primary.DEFAULT : '#f0f4f8',
                            scale: isSelected ? 1 : 0.95,
                          }}
                          transition={{ type: 'timing', duration: 200 }}
                          className="w-14 h-14 rounded-2xl items-center justify-center"
                        >
                          <Icon
                            size={24}
                            color={isSelected ? '#FFF' : Colors.neutral[900]}
                            strokeWidth={2}
                          />
                        </MotiView>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-x-3 mt-4">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 h-14 rounded-full bg-neutral-100 items-center justify-center"
                >
                  <AtelierTypography variant="label" className="text-neutral-900 tracking-[1px]">
                    HỦY
                  </AtelierTypography>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-full bg-primary items-center justify-center"
                  style={{ opacity: isSubmitting ? 0.6 : 1 }}
                >
                  <AtelierTypography variant="label" className="text-white tracking-[1px]">
                    {isSubmitting ? 'ĐANG TẠO...' : 'TẠO'}
                  </AtelierTypography>
                </TouchableOpacity>
              </View>
            </MotiView>
          </View>
        )}
      </AnimatePresence>
    </Modal>
  );
};
