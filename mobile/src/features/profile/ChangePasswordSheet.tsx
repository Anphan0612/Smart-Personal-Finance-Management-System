import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Lock, Check, ShieldCheck, Eye, EyeOff, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AtelierTypography, AtelierButton, AtelierInput } from '@/components/ui';
import { putter } from '../../services/api';
import { Colors } from '@/constants/tokens';
import { RequirementItem } from './RequirementItem';

// --- Public API ---
export interface ChangePasswordSheetRef {
  open: () => void;
  close: () => void;
}

// --- Component ---
export const ChangePasswordSheet = forwardRef<ChangePasswordSheetRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation State
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    symbol: false,
    number: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // --- Expose API ---
  useImperativeHandle(ref, () => ({
    open: () => {
      resetForm();
      bottomSheetRef.current?.present();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    close: () => bottomSheetRef.current?.dismiss(),
  }));

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setIsSuccess(false);
    setStrength(0);
  };

  // --- Strength Calculation ---
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

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [newPassword, confirmPassword]);

  const getStrengthColor = () => {
    switch (strength) {
      case 1:
        return '#ef4444';
      case 2:
        return '#f59e0b';
      case 3:
        return '#10b981';
      case 4:
        return '#059669';
      default:
        return Colors.neutral[200];
    }
  };

  const getStrengthText = () => {
    switch (strength) {
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

  // --- Submit ---
  const handleSubmit = async () => {
    if (!currentPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (strength < 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Mật khẩu yếu', 'Vui lòng tạo mật khẩu mạnh hơn.');
      return;
    }
    if (!passwordsMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsUpdating(true);
      await putter('/users/change-password', { currentPassword, newPassword });

      // Success flow
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSuccess(true);

      // Auto close after showing success state
      setTimeout(() => {
        bottomSheetRef.current?.close();
      }, 1800);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Mật khẩu hiện tại không chính xác.';
      Alert.alert('Lỗi', message);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Render ---
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="bg-white border-t border-neutral-100 px-6 pt-5 pb-2 shadow-2xl"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.03,
            shadowRadius: 15,
          }}
        >
          <AtelierButton
            label="Cập nhật mật khẩu"
            variant="gradient"
            onPress={handleSubmit}
            loading={isUpdating}
            disabled={strength < 3 || !passwordsMatch || !currentPassword}
          />
        </MotiView>
      </BottomSheetFooter>
    ),
    [insets.bottom, handleSubmit, isUpdating, strength, passwordsMatch, currentPassword],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: Colors.neutral[300], width: 40 }}
      backgroundStyle={{
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      footerComponent={!isSuccess ? renderFooter : undefined}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: insets.bottom + 100, // Extra space for sticky footer
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Sheet Header */}
        <View className="flex-row items-center justify-between py-2 mb-4">
          <View>
            <AtelierTypography
              style={{ fontFamily: 'Manrope_700Bold', fontSize: 24, color: Colors.neutral[900] }}
            >
              Đổi mật khẩu
            </AtelierTypography>
            <View className="h-1 w-12 bg-primary rounded-full mt-1" />
          </View>
          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.dismiss()}
            className="w-10 h-10 bg-neutral-50 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <X size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Success State */}
        {isSuccess ? (
          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="items-center justify-center py-20 gap-6"
          >
            <View className="w-24 h-24 bg-green-50 rounded-[32px] items-center justify-center">
              <Check size={48} color="#10b981" strokeWidth={3} />
            </View>
            <View className="items-center gap-2">
              <AtelierTypography
                style={{
                  fontFamily: 'Manrope_800ExtraBold',
                  fontSize: 28,
                  color: Colors.neutral[900],
                }}
              >
                Hoàn tất!
              </AtelierTypography>
              <AtelierTypography
                variant="body"
                className="text-neutral-400 text-center px-8 leading-6"
              >
                Mật khẩu của bạn đã được cập nhật thành công và an toàn.
              </AtelierTypography>
            </View>
          </MotiView>
        ) : (
          <>
            {/* Icon + Subtitle */}
            <View className="items-center py-6 gap-3">
              <MotiView
                from={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 bg-primary/5 rounded-3xl items-center justify-center"
              >
                <ShieldCheck size={32} color={Colors.primary[600]} />
              </MotiView>
              <AtelierTypography
                variant="body"
                className="text-center text-neutral-400 px-10 leading-6"
              >
                Mật khẩu mạnh giúp bảo vệ tài sản và thông tin cá nhân của bạn tốt hơn.
              </AtelierTypography>
            </View>

            {/* Form */}
            <View className="gap-5">
              {/* Current Password */}
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

              {/* New Password + Strength Meter */}
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

                {newPassword.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <View className="flex-row justify-between items-center mb-2 px-1">
                      <AtelierTypography variant="caption" className="text-neutral-400 font-medium">
                        Độ bảo mật:{' '}
                        <AtelierTypography
                          variant="caption"
                          style={{ color: getStrengthColor(), fontWeight: '700' }}
                        >
                          {getStrengthText()}
                        </AtelierTypography>
                      </AtelierTypography>
                    </View>

                    {/* Strength Bar */}
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

                    {/* Requirements Checklist */}
                    <View className="mt-4 gap-3 bg-neutral-50/50 p-4 rounded-3xl border border-neutral-50">
                      <RequirementItem met={requirements.length} label="Độ dài tối thiểu 8 ký tự" />
                      <RequirementItem
                        met={requirements.uppercase}
                        label="Chứa ít nhất 1 chữ hoa (A-Z)"
                      />
                      <RequirementItem
                        met={requirements.number}
                        label="Chứa ít nhất 1 chữ số (0-9)"
                      />
                      <RequirementItem
                        met={requirements.symbol}
                        label="Chứa ít nhất 1 ký tự đặc biệt (!@#...)"
                      />
                    </View>
                  </MotiView>
                )}
              </View>

              {/* Confirm Password */}
              <AtelierInput
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showNewPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={!passwordsMatch ? 'Mật khẩu xác nhận không khớp' : undefined}
              />
            </View>
          </>
        )}
      </BottomSheetScrollView>

      {/* Footer is now handled by BottomSheetFooter component */}
    </BottomSheetModal>
  );
});

ChangePasswordSheet.displayName = 'ChangePasswordSheet';
