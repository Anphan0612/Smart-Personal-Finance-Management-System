import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Wallet as WalletIcon, Info } from 'lucide-react-native';
import { poster } from '../../src/services/api';
import { useAppStore } from '../../src/store/useAppStore';

export default function InitialWalletScreen() {
  const router = useRouter();
  const onboardingCurrency = useAppStore((state: any) => state.onboardingCurrency) || 'VND';
  const [walletName, setWalletName] = useState('My Main Wallet');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!walletName.trim()) {
      alert('Please enter a wallet name');
      return;
    }

    setLoading(true);
    try {
      console.log(`[ONBOARDING] Creating wallet with currency: ${onboardingCurrency}...`);
      await poster('/wallets', {
        name: walletName,
        balance: parseFloat(balance.replace(/,/g, '') || '0'),
        currencyCode: onboardingCurrency,
        type: 'CASH'
      });

      // Clear the onboarding state so we don't accidentally reuse it later
      useAppStore.getState().setOnboardingCurrency(null);
      
      // Redirect to dashboard
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      console.error('[ONBOARDING ERROR]', error);
      const message = error.response?.data?.message || 'Failed to create wallet. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <WalletIcon color="#0052CC" size={32} />
            </View>
            <Text style={styles.title}>First Wallet</Text>
            <Text style={styles.subtitle}>
              Give your first wallet a name and set its starting balance.
            </Text>
          </MotiView>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wallet Name</Text>
              <TextInput
                style={styles.input}
                value={walletName}
                onChangeText={setWalletName}
                placeholder="e.g. Cash, Bank Account"
              />
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.label}>Starting Balance</Text>
              <View style={styles.amountWrapper}>
                <Text style={styles.currencySymbol}>₫</Text>
                <TextInput
                  style={styles.amountInput}
                  value={balance}
                  onChangeText={setBalance}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.tipContainer}>
                <Info size={16} color="#6B7280" />
                <Text style={styles.tipText}>
                  You can change this anytime later.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable 
              style={[styles.finishButton, loading && styles.disabledButton]} 
              onPress={handleFinish}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.finishButtonText}>Complete Setup</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 48,
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
    paddingHorizontal: 10,
  },
  form: {
    gap: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#111827',
  },
  balanceContainer: {
    alignItems: 'center',
    gap: 16,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 48,
    color: '#0052CC',
  },
  amountInput: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 48,
    color: '#111827',
    minWidth: 100,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  finishButton: {
    backgroundColor: '#0052CC',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
});
