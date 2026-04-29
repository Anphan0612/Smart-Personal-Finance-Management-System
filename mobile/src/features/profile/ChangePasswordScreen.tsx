import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Lock,
  ChevronLeft,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';
import { AtelierTypography, AtelierButton, AtelierInput } from '@/components/ui';
import { putter } from '../../services/api';
import { Colors } from '@/constants/tokens';

/**
 * High-Security Password Change Screen
 * Follows PLAN-password-security-upgrade.md
 */
export default function ChangePasswordScreen() {
  const router = useRouter();

  // State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Strength Meter State
  const [strength, setStrength] = useState(0); // 0-4
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    symbol: false,
    number: false,
  });

  // Real-time Match Validation
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Calculate Strength & Validate Requirements
  useEffect(() => {
    const reqs = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
    };
    setRequirements(reqs);

    let score = 0;
    if (newPassword.length > 0) score++;
    if (reqs.length) score++;
    if (reqs.uppercase && reqs.number) score++;
    if (reqs.symbol) score++;

    setStrength(score);
  }, [newPassword]);

  // Check Match
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (!currentPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (strength < 3) {
      Alert.alert('Mật khẩu yếu', 'Vui lòng tạo mật khẩu mạnh hơn để bảo vệ tài khoản của bạn.');
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsUpdating(true);
      await putter('/users/change-password', {
        currentPassword,
        newPassword,
      });

      Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi thành công.', [
        { text: 'OK', onPress: () => router.back() },
      ]);

      // Memory Security: Clear state after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Mật khẩu hiện tại không chính xác.';
      Alert.alert('Lỗi', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
        return Colors.neutral[200];
      case 1:
        return '#ef4444'; // Red
      case 2:
        return '#f59e0b'; // Amber
      case 3:
        return '#10b981'; // Emerald
      case 4:
        return '#059669'; // Green
      default:
        return Colors.neutral[200];
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
        return '';
      case 1:
        return 'Rất yếu';
      case 2:
        return 'Trung bình';
      case 3:
        return 'Mạnh';
      case 4:
        return 'Rất an toàn';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-12 pb-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-atelier-low"
          >
            <ChevronLeft size={24} color={Colors.neutral[900]} />
          </TouchableOpacity>
          <AtelierTypography variant="h2" className="flex-1 text-center mr-10">
            Đổi mật khẩu
          </AtelierTypography>
        </View>

        <View className="px-6 pt-4">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary/5 rounded-full items-center justify-center mb-4">
              <ShieldCheck size={40} color={Colors.primary[600]} />
            </View>
            <AtelierTypography variant="body" className="text-center text-neutral-500 px-4">
              Mật khẩu mạnh giúp bảo vệ tài sản và thông tin cá nhân của bạn tốt hơn.
            </AtelierTypography>
          </View>

          {/* Form */}
          <View className="gap-6">
            <AtelierInput
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu đang dùng"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#74777f" />
                  ) : (
                    <Eye size={20} color="#74777f" />
                  )}
                </TouchableOpacity>
              }
            />

            <View className="gap-2">
              <AtelierInput
                label="Mật khẩu mới"
                placeholder="Tối thiểu 8 ký tự"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? (
                      <EyeOff size={20} color="#74777f" />
                    ) : (
                      <Eye size={20} color="#74777f" />
                    )}
                  </TouchableOpacity>
                }
              />

              {/* Hybrid Strength Meter */}
              {newPassword.length > 0 && (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <AtelierTypography variant="caption" className="text-neutral-500">
                      Độ mạnh:{' '}
                      <AtelierTypography variant="caption" style={{ color: getStrengthColor() }}>
                        {getStrengthText()}
                      </AtelierTypography>
                    </AtelierTypography>
                  </View>

                  {/* Dynamic Color Bar */}
                  <View className="h-1.5 bg-neutral-100 rounded-full overflow-hidden flex-row gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        className="flex-1 h-full rounded-full"
                        style={{
                          backgroundColor:
                            strength >= level ? getStrengthColor() : Colors.neutral[100],
                        }}
                      />
                    ))}
                  </View>

                  {/* Live Checklist */}
                  <View className="mt-4 gap-2">
                    <RequirementItem met={requirements.length} label="Ít nhất 8 ký tự" />
                    <RequirementItem met={requirements.uppercase} label="Có chữ hoa (A-Z)" />
                    <RequirementItem met={requirements.number} label="Có chữ số (0-9)" />
                    <RequirementItem met={requirements.symbol} label="Có ký tự đặc biệt (!@#...)" />
                  </View>
                </MotiView>
              )}
            </View>

            <View className="gap-2">
              <AtelierInput
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showNewPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={!passwordsMatch ? 'Mật khẩu xác nhận không khớp' : undefined}
              />
              {!passwordsMatch && (
                <MotiText
                  from={{ opacity: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  className="text-red-500 text-xs ml-1"
                >
                  <AlertCircle size={12} /> Mật khẩu không khớp
                </MotiText>
              )}
            </View>
          </View>

          <AtelierButton
            label="Cập nhật mật khẩu"
            variant="primary"
            className="mt-12"
            onPress={handleSubmit}
            loading={isUpdating}
            disabled={strength < 3 || !passwordsMatch || !currentPassword}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`w-4 h-4 rounded-full items-center justify-center ${met ? 'bg-green-500' : 'bg-neutral-100'}`}
      >
        {met && <Check size={10} color="white" strokeWidth={3} />}
      </View>
      <AtelierTypography
        variant="caption"
        className={met ? 'text-neutral-900' : 'text-neutral-400'}
      >
        {label}
      </AtelierTypography>
    </View>
  );
}
