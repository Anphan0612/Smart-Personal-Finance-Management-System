import React from 'react';
import { MotiView } from 'moti';
import { ViewStyle, DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, radius = 8, style }: SkeletonProps) => {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: '#E2E8F0', // color-surface-container-low
        },
        style,
      ]}
    />
  );
};
