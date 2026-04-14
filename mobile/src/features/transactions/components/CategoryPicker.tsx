import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { 
  Utensils, 
  Wallet, 
  Car, 
  Home, 
  Clapperboard, 
  ShoppingBag, 
  HeartPulse, 
  MoreHorizontal,
  Search,
  Check
} from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const COMMON_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Ăn uống', icon: Utensils, color: '#FF9500' },
  { id: 'c2', name: 'Lương', icon: Wallet, color: '#34C759' },
  { id: 'c3', name: 'Di chuyển', icon: Car, color: '#007AFF' },
  { id: 'c4', name: 'Thuê nhà', icon: Home, color: '#5856D6' },
  { id: 'c5', name: 'Giải trí', icon: Clapperboard, color: '#FF2D55' },
  { id: 'c6', name: 'Mua sắm', icon: ShoppingBag, color: '#FFCC00' },
  { id: 'c7', name: 'Sức khỏe', icon: HeartPulse, color: '#FF3B30' },
  { id: 'c8', name: 'Khác', icon: MoreHorizontal, color: '#8E8E93' },
];

interface CategoryPickerProps {
  selectedId: string | null;
  onSelect: (category: Category) => void;
}

export const CategoryPicker = ({ selectedId, onSelect }: CategoryPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category);
  };

  return (
    <View className="gap-4">
      <View className="flex-row justify-between items-center px-1">
        <AtelierTypography variant="label" className="text-surface-on-variant">
          Danh mục
        </AtelierTypography>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <AtelierTypography variant="label" className="text-primary font-bold">
            {isExpanded ? 'Thu gọn' : 'Tất cả'}
          </AtelierTypography>
        </TouchableOpacity>
      </View>

      {/* Grid of Common Categories */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {COMMON_CATEGORIES.map((cat) => {
          const isSelected = selectedId === cat.id;
          const Icon = cat.icon;
          
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleSelect(cat)}
              className="items-center w-[22%]"
              activeOpacity={0.7}
            >
              <MotiView
                animate={{
                  scale: isSelected ? 1.1 : 1,
                  backgroundColor: isSelected ? cat.color : '#F5F7FA',
                }}
                className="w-14 h-14 rounded-2xl items-center justify-center mb-1"
                style={{
                  shadowColor: isSelected ? cat.color : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.3 : 0,
                  shadowRadius: 8,
                }}
              >
                <Icon size={24} color={isSelected ? '#FFF' : '#4B5563'} strokeWidth={2} />
              </MotiView>
              <AtelierTypography 
                variant="caption" 
                className={`text-[10px] text-center ${isSelected ? 'text-surface-on font-bold' : 'text-surface-on-variant'}`}
                numberOfLines={1}
              >
                {cat.name}
              </AtelierTypography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar - only shown or focused when needed */}
      {isExpanded && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mt-2"
        >
          <View className="flex-row items-center bg-surface-container-low rounded-xl px-4 py-2 border border-surface-variant/20">
            <Search size={18} color="#8E8E93" />
            <TextInput
              placeholder="Tìm kiếm danh mục khác..."
              className="flex-1 ml-3 h-10 text-surface-on font-inter-regular"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#ABACB2"
            />
          </View>
          
          {/* This would be populated by search results in a real implementation */}
          {searchQuery.length > 0 && (
            <View className="mt-2 bg-white rounded-xl shadow-sm border border-neutral-100 p-2">
              <TouchableOpacity className="flex-row items-center p-3">
                <View className="w-8 h-8 rounded-lg bg-neutral-100 items-center justify-center mr-3">
                  <MoreHorizontal size={16} color="#4B5563" />
                </View>
                <AtelierTypography variant="body" className="text-sm">
                  Kết quả cho "{searchQuery}"
                </AtelierTypography>
              </TouchableOpacity>
            </View>
          )}
        </MotiView>
      )}
    </View>
  );
};
