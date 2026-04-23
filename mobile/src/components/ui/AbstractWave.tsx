import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AbstractWaveProps {
  color?: string;
  style?: ViewStyle;
}

export function AbstractWave({ color = 'white', style }: AbstractWaveProps) {
  return (
    <View style={[{ height: 100, width: '100%', opacity: 0.3 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
        <Path d="M0,80 Q50,70 100,85 T200,60 T300,75 T400,40 L400,100 L0,100 Z" fill={color} />
        <Path
          d="M0,80 Q50,70 100,85 T200,60 T300,75 T400,40"
          fill="transparent"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </Svg>
    </View>
  );
}
