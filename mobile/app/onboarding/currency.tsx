import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Check, Globe } from 'lucide-react-native';
import { useAppStore } from '../../src/store/useAppStore';

const CURRENCIES = [
  { id: 'VND', name: 'Vietnamese Đồng', symbol: '₫', flag: '🇻🇳' },
  { id: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { id: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { id: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
];

export default function CurrencySelectionScreen() {
  const router = useRouter();
  const setOnboardingCurrency = useAppStore((state: any) => state.setOnboardingCurrency);
  const [selected, setSelected] = useState('VND');

  const handleNext = () => {
    setOnboardingCurrency(selected);
    router.push('/onboarding/wallet' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Globe color="#0052CC" size={32} />
          </View>
          <Text style={styles.title}>Primary Currency</Text>
          <Text style={styles.subtitle}>
            Select the currency you use most. This will be the base for your overall balance.
          </Text>
        </MotiView>

        <View style={styles.listContainer}>
          {CURRENCIES.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.card,
                selected === item.id && styles.selectedCard
              ]}
              onPress={() => setSelected(item.id)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.flag}>{item.flag}</Text>
                <View>
                  <Text style={styles.currencyName}>{item.name}</Text>
                  <Text style={styles.currencyCode}>{item.id} • {item.symbol}</Text>
                </View>
              </View>
              {selected === item.id && (
                <View style={styles.checkCircle}>
                  <Check color="white" size={14} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Confirm & Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 82, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 28,
    color: '#181c22',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderColor: '#0052CC',
    backgroundColor: 'rgba(0, 82, 204, 0.04)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flag: {
    fontSize: 32,
  },
  currencyName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#111827',
  },
  currencyCode: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: '#181c22',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});
