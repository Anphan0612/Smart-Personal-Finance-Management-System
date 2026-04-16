import React from 'react';
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { getIconFromName, getColorForCategory } from '@/constants/icon-map';
import * as Haptics from 'expo-haptics';

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

interface QuickCategorySelectProps {
  selectedId: string | null;
  categories: Category[];
  onSelect: (category: Category) => void;
}

export const QuickCategorySelect = ({ selectedId, categories, onSelect }: QuickCategorySelectProps) => {
  const handleSelect = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(category);
  };

  // Show top categories for quick access
  const quickCategories = categories.slice(0, 10);

  if (categories.length === 0) {
    return (
      <View className="mx-6 p-10 bg-surface-container-low rounded-[32px] items-center justify-center">
        <View className="w-16 h-16 bg-white/50 rounded-full items-center justify-center mb-4">
           {/* Subtle placeholder icon or illustration would go here */}
           <View className="w-8 h-8 rounded-lg bg-surface-on-variant/10" />
        </View>
        <AtelierTypography variant="body" className="text-surface-on-variant text-center opacity-70">
          Phòng triển lãm danh mục còn trống.
        </AtelierTypography>
        <AtelierTypography variant="caption" className="text-primary font-manrope-bold mt-2">
          HÃY TẠO DANH MỤC MỚI
        </AtelierTypography>
      </View>
    );
  }

  return (
    <View className="px-8 mt-6">
      <View className="flex-row justify-between items-center mb-6">
        <AtelierTypography variant="label" className="text-on-surface-variant text-[10px] tracking-[2px]">
          CATEGORIES
        </AtelierTypography>
        <TouchableOpacity className="flex-row items-center">
           <AtelierTypography variant="caption" className="text-primary font-manrope-bold text-[11px] mr-1">
             BROWSE ALL
           </AtelierTypography>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-y-6">
        {quickCategories.map((cat, index) => {
          const isSelected = selectedId === cat.id;
          const Icon = getIconFromName(cat.iconName);
          const themeColor = getColorForCategory(cat.id);

          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleSelect(cat)}
              activeOpacity={0.8}
              style={{ width: '25%', alignItems: 'center' }}
            >
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: isSelected ? 1 : 0.95,
                  backgroundColor: isSelected ? themeColor : '#f0f4f8',
                }}
                transition={{
                  type: 'timing',
                  duration: 250,
                  delay: index * 30,
                }}
                className="w-14 h-14 rounded-[20px] items-center justify-center relative shadow-sm"
              >
                <Icon
                  size={24}
                  color={isSelected ? '#FFF' : '#171c1f'}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
                
                {isSelected && (
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center"
                    style={{ elevation: 2 }}
                  >
                    <View className="w-2.5 h-2.5 bg-primary rounded-full" />
                  </MotiView>
                )}
              </MotiView>
              <AtelierTypography
                variant="label"
                className={`text-[9px] mt-2 text-center tracking-normal font-manrope-bold ${
                  isSelected ? 'text-surface-on font-extrabold' : 'text-on-surface-variant'
                }`}
                numberOfLines={1}
              >
                {cat.name.toUpperCase()}
              </AtelierTypography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
