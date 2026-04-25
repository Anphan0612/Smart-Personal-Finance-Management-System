import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { poster } from '../../src/services/api';
import { useAppStore } from '../../src/store/useAppStore';

export default function RegisterScreen() {
  const router = useRouter();
  const setTokens = useAppStore((state: any) => state.setTokens);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleRegister = async () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log(`[AUTH] Registering ${formData.email}...`);
      const response: any = await poster('/auth/register', {
        username: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      if (response && response.accessToken) {
        setTokens(response.accessToken, response.refreshToken, {
          name: response.name,
          email: response.email,
        });
        
        // Navigate to Onboarding
        router.push('/onboarding/currency' as any);
      }
    } catch (error: any) {
      console.error('[AUTH ERROR]', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color="#181c22" size={24} />
          </Pressable>

          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            style={styles.header}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Atelier Finance and start mastering your money.</Text>
          </MotiView>

          <View style={styles.form}>
            {/* Full Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({...formData, fullName: text})}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </Pressable>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>

            <Pressable 
              style={[styles.submitButton, loading && styles.disabledButton]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 32,
    color: '#181c22',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    marginTop: 8,
  },
  termsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0052CC',
  },
  submitButton: {
    backgroundColor: '#0052CC',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});
