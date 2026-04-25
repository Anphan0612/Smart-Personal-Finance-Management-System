import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000 }}
          style={styles.header}
        >
          <Text style={styles.brand}>ATELIER FINANCE</Text>
          <Text style={styles.headline}>Precision in every{"\n"}financial move.</Text>
          <Text style={styles.subheadline}>
            A sophisticated management system for those who value clarity and elegance.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 500 }}
          style={styles.footer}
        >
          <Pressable 
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight color="white" size={20} strokeWidth={2.5} />
          </Pressable>

          <Pressable 
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            testID="welcome-login-button"
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.loginText}>Sign In</Text>
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0052CC', // Deep brand blue
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  header: {
    marginBottom: 48,
  },
  brand: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  headline: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 42,
    color: '#FFFFFF',
    lineHeight: 50,
    marginBottom: 16,
  },
  subheadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: '#0052CC',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
