import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Sparkles } from 'lucide-react-native';

export default function AppLoading() {
  return (
    <View className="flex-1 bg-surface items-center justify-center">
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 1000 }}
        className="items-center"
      >
        <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6">
          <Sparkles size={40} color="#005ab4" />
        </View>
        <Text className="font-headline font-extrabold text-2xl text-on-surface tracking-tight mb-2">
          Atelier Finance
        </Text>
        <Text className="text-on-surface-variant font-medium text-sm mb-8">
          Personalizing your wealth...
        </Text>
        <ActivityIndicator color="#005ab4" size="small" />
      </MotiView>
      
      {/* Bottom version or branding */}
      <View className="absolute bottom-12 items-center">
        <Text className="text-[10px] text-outline font-bold uppercase tracking-widest">
          The Financial Atelier v1.0
        </Text>
      </View>
    </View>
  );
}
