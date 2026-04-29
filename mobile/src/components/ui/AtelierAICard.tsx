import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { AtelierGlassView } from './AtelierGlassView';
import { AtelierTokens } from '../../constants/AtelierTokens';
import { MotiView } from 'moti';

interface AtelierAICardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
}

export const AtelierAICard = ({ children, style, delay = 0, ...rest }: AtelierAICardProps) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay }}
      className="w-full mt-4"
    >
      <AtelierGlassView
        intensity={30}
        tint="light"
        className="rounded-[28px] overflow-hidden border border-white/20 shadow-lg shadow-black/10"
        style={style}
        {...rest}
      >
        <View className="p-5">
          {children}
        </View>
      </AtelierGlassView>
    </MotiView>
  );
};
