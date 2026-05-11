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
import Toast from 'react-native-toast-message';

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
  
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleRegister = async () => {
    // Reset errors
    setFormErrors({ fullName: '', email: '', password: '' });
    
    let hasError = false;
    const newErrors = { fullName: '', email: '', password: '' };

    // Basic validation
    if (!formData.fullName) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
      hasError = true;
    }
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      hasError = true;
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      hasError = true;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
      hasError = true;
    }

    if (hasError) {
      setFormErrors(newErrors);
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
        
        Toast.show({
          type: 'success',
          text1: 'Đăng ký thành công!',
          text2: 'Chào mừng bạn đến với Atelier Finance',
          position: 'top'
        });
        
        // Navigate to Onboarding
        setTimeout(() => {
          router.push('/onboarding/currency' as any);
        }, 1000);
      }
    } catch (error: any) {
      console.error('[AUTH ERROR]', error);
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Không thể đăng ký tài khoản';
      
      if (status === 400 || status === 409) {
        setFormErrors(prev => ({ ...prev, email: message }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi hệ thống',
          text2: message || 'Mất kết nối với máy chủ',
          position: 'top'
        });
      }
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
            <Text style={styles.title}>Đăng ký tài khoản</Text>
            <Text style={styles.subtitle}>Tham gia Atelier Finance và bắt đầu làm chủ tài chính của bạn ngay hôm nay.</Text>
          </MotiView>

          <View style={styles.form}>
            {/* Full Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={[styles.inputWrapper, formErrors.fullName ? styles.inputError : null]}>
                <User size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#9CA3AF"
                  value={formData.fullName}
                  onChangeText={(text) => {
                    setFormData({...formData, fullName: text});
                    if (formErrors.fullName) setFormErrors({...formErrors, fullName: ''});
                  }}
                />
              </View>
              {formErrors.fullName ? <Text style={styles.errorText}>{formErrors.fullName}</Text> : null}
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Địa chỉ Email</Text>
              <View style={[styles.inputWrapper, formErrors.email ? styles.inputError : null]}>
                <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({...formData, email: text});
                    if (formErrors.email) setFormErrors({...formErrors, email: ''});
                  }}
                />
              </View>
              {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[styles.inputWrapper, formErrors.password ? styles.inputError : null]}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({...formData, password: text});
                    if (formErrors.password) setFormErrors({...formErrors, password: ''});
                  }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </Pressable>
              </View>
              {formErrors.password ? <Text style={styles.errorText}>{formErrors.password}</Text> : null}
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Bằng cách đăng ký, bạn đồng ý với <Text style={styles.linkText}>Điều khoản</Text> và <Text style={styles.linkText}>Chính sách bảo mật</Text> của chúng tôi.
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
                <Text style={styles.submitButtonText}>Đăng ký ngay</Text>
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#EF4444',
    marginTop: -4,
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
