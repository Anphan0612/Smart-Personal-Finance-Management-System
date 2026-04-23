import React, { useEffect, useState } from 'react';
import { View, Platform, ViewProps } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';
import * as Device from 'expo-device';

interface AtelierGlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'transparent' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial';
  fallbackColor?: string;
  children?: React.ReactNode;
}

export const AtelierGlassView = ({
  intensity = 50,
  tint = 'light',
  fallbackColor = 'rgba(255, 255, 255, 0.85)',
  style,
  children,
  ...rest
}: AtelierGlassViewProps) => {
  const [isHighEnd, setIsHighEnd] = useState(true);

  useEffect(() => {
    const checkDeviceCapability = async () => {
      if (Platform.OS === 'android') {
        // If the device year class is older than 2020, we consider it a low-end device
        // and disable the BlurView to maintain 60fps.
        if (Device.deviceYearClass && Device.deviceYearClass < 2020) {
          setIsHighEnd(false);
        }
      }
    };
    
    checkDeviceCapability();
  }, []);

  if (isHighEnd) {
    return (
      <BlurView 
        intensity={intensity} 
        tint={tint} 
        style={style as BlurViewProps['style']} 
        {...(rest as any)}
      >
        {children}
      </BlurView>
    );
  }

  // Lite Mode: Semi-transparent solid background instead of blur
  return (
    <View style={[style, { backgroundColor: fallbackColor }]} {...rest}>
      {children}
    </View>
  );
};
