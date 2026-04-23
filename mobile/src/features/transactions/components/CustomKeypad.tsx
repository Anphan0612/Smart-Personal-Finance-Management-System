import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Delete } from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import * as Haptics from 'expo-haptics';

interface CustomKeypadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
}

const KEYPAD_BUTTONS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['000', '0', 'delete'],
];

export const CustomKeypad = ({ onPress, onDelete }: CustomKeypadProps) => {
  const handlePress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value === 'delete') {
      onDelete();
    } else {
      onPress(value);
    }
  };

  return (
    <View className="px-6 py-6 gap-y-4">
      {KEYPAD_BUTTONS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-x-4">
          {row.map((button) => (
            <TouchableOpacity
              key={button}
              onPress={() => handlePress(button)}
              activeOpacity={0.7}
              className="flex-1"
            >
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing',
                  duration: 300,
                  delay: (rowIndex * 3 + row.indexOf(button)) * 20,
                }}
                className="bg-white h-[72px] rounded-[24px] items-center justify-center"
                style={{
                  shadowColor: '#171c1f',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                {button === 'delete' ? (
                  <Delete size={24} color="#171c1f" strokeWidth={2} />
                ) : (
                  <AtelierTypography
                    variant="h2"
                    className="text-2xl font-manrope-extrabold text-surface-on"
                  >
                    {button}
                  </AtelierTypography>
                )}
              </MotiView>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};
