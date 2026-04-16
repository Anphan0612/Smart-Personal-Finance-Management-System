import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { getIconFromName, getColorForCategory } from '@/constants/icon-map';

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

interface CategoryPickerProps {
  selectedId: string | null;
  categories: Category[];
  onSelect: (category: Category) => void;
  isLoading?: boolean;
}

export const CategoryPicker = React.memo(({ selectedId, categories, onSelect, isLoading = false }: CategoryPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleSelect = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category);
  };

  if (isLoading) {
    return (
      <View className="gap-4">
        <View className="flex-row justify-between items-center px-1">
          <AtelierTypography variant="label" className="text-surface-on-variant">
            Danh mục
          </AtelierTypography>
        </View>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <View key={i} className="items-center w-[22%]">
              <View className="w-14 h-14 rounded-2xl bg-slate-800 animate-pulse mb-1" />
              <View className="w-12 h-3 rounded bg-slate-800 animate-pulse" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View className="gap-4">
        <View className="flex-row justify-between items-center px-1">
          <AtelierTypography variant="label" className="text-surface-on-variant">
            Danh mục
          </AtelierTypography>
        </View>
        <View className="py-8 items-center">
          <AtelierTypography variant="body" className="text-slate-500 text-sm">
            Không có danh mục nào
          </AtelierTypography>
        </View>
      </View>
    );
  }

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

      {/* Grid of Categories */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {filteredCategories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const Icon = getIconFromName(cat.iconName);
          const color = getColorForCategory(cat.id);

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
                  backgroundColor: isSelected ? color : '#F5F7FA',
                }}
                className="w-14 h-14 rounded-2xl items-center justify-center mb-1"
                style={{
                  shadowColor: isSelected ? color : '#000',
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

      {/* Search Bar - only shown when expanded */}
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

          {/* Show no results message if search returns nothing */}
          {searchQuery.length > 0 && filteredCategories.length === 0 && (
            <View className="mt-2 bg-white rounded-xl shadow-sm border border-neutral-100 p-4">
              <AtelierTypography variant="body" className="text-sm text-center text-slate-500">
                Không tìm thấy danh mục "{searchQuery}"
              </AtelierTypography>
            </View>
          )}
        </MotiView>
      )}
    </View>
  );
});
