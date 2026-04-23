import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  X,
  Zap,
  ArrowRight,
  Keyboard,
  Check,
  Loader,
} from 'lucide-react-native';
import { router } from 'expo-router';
import apiClient from '../../services/api';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams } from 'expo-router';
import { AtelierTypography, AtelierCard } from '@/components/ui';
import { Colors } from '@/constants/tokens';

const PROCESSING_STEPS = [
  { key: 'PREPROCESSING', icon: '🔍', label: 'Đang làm sắc nét ảnh...' },
  { key: 'OCR_EXTRACTING', icon: '📝', label: 'Đang trích xuất văn bản...' },
  { key: 'PARSING', icon: '📊', label: 'Đang phân tích dữ liệu...' },
  { key: 'AI_HEALING', icon: '🧠', label: 'AI đang đối soát số tiền...' },
  { key: 'DONE', icon: '✅', label: 'Hoàn tất!' },
];

export default function ReceiptScannerScreen() {
  const { source } = useLocalSearchParams<{ source: 'camera' | 'library' }>();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const isCancelledRef = useRef(false);
  const [hasInited, setHasInited] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLoadingState = (val: boolean) => {
    setLoading(val);
    isLoadingRef.current = val;
  };

  useEffect(() => {
    if (source && !hasInited) {
      setHasInited(true);
      pickImage(source === 'camera');
    }
  }, [source]);

  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      isLoadingRef.current = false;
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, []);

  const simulateSteps = () => {
    setCurrentStep(0);
    setCompletedSteps([]);

    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step++;
      if (step < PROCESSING_STEPS.length - 1) {
        setCompletedSteps((prev) => [...prev, PROCESSING_STEPS[step - 1].key]);
        setCurrentStep(step);
      } else {
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      }
    }, 1500);
  };

  const finishSteps = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    const allKeys = PROCESSING_STEPS.slice(0, -1).map((s) => s.key);
    setCompletedSteps(allKeys);
    setCurrentStep(PROCESSING_STEPS.length - 1);
  };

  const compressImage = async (uri: string) => {
    try {
      const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1200 } }], {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return result.uri;
    } catch (error) {
      console.error('Compression error:', error);
      return uri;
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });

      if (!result.canceled) {
        setLoadingState(true);
        const compressed = await compressImage(result.assets[0].uri);
        setImage(compressed);
        setLoadingState(false);
      } else if (!image) {
        router.back();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể truy cập camera hoặc thư viện ảnh.');
    }
  };

  const pollWithDelay = async (receiptId: string, retryCount = 0) => {
    if (isCancelledRef.current || !isLoadingRef.current) return;

    try {
      const response = await apiClient.get(`/receipts/${receiptId}`);

      if (response.data.success) {
        const status = response.data.data.status;
        if (currentStep < 2) setCurrentStep(2);

        if (status === 'PROCESSED' || status === 'CONFIRMED') {
          finishSteps();
          setTimeout(() => {
            if (isCancelledRef.current) return;
            setLoadingState(false);
            router.push({
              pathname: '/receipt/review',
              params: { receiptId },
            });
          }, 800);
          return;
        } else if (status === 'FAILED') {
          setLoadingState(false);
          Alert.alert('Lỗi', 'AI không thể xử lý hóa đơn này.');
          return;
        }
      }
      pollingTimerRef.current = setTimeout(() => pollWithDelay(receiptId, 0), 3000);
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        setLoadingState(false);
        Alert.alert('Phiên làm việc hết hạn', 'Vui lòng đăng nhập lại.');
        router.replace('/(auth)/login');
        return;
      }
      if (retryCount >= 10) {
        setLoading(false);
        Alert.alert(
          'Lỗi kết nối',
          'Mạng không ổn định. Vui lòng kiểm tra lại sau trong danh sách giao dịch.',
        );
        return;
      }
      pollingTimerRef.current = setTimeout(() => pollWithDelay(receiptId, retryCount + 1), 3000);
    }
  };

  const uploadAndProcess = async () => {
    if (!image) return;

    setLoadingState(true);
    simulateSteps();

    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri: image,
        name: 'receipt.jpg',
        type: 'image/jpeg',
      });

      const response = await apiClient.post('/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const receiptId = response.data.data.id;
        pollWithDelay(receiptId);
      }
    } catch (error) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setLoadingState(false);
      Alert.alert('Lỗi Upload', 'Không thể tải ảnh lên máy chủ. Vui lòng kiểm tra kết nối mạng.', [
        { text: 'Thử lại', style: 'cancel', onPress: () => resetState() },
      ]);
    }
  };

  const resetState = () => {
    setCurrentStep(-1);
    setCompletedSteps([]);
    setLoadingState(false);
  };

  const renderStepIndicator = () => {
    if (currentStep < 0) return null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 24,
          paddingTop: 40,
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.95)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        {PROCESSING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = index === currentStep;
          const isVisible = index <= currentStep;

          if (!isVisible) return null;

          return (
            <MotiView
              key={step.key}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300, delay: index * 50 }}
              className="flex-row items-center py-2"
            >
              <View
                className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-primary' : 'bg-neutral-800'}`}
              >
                {isCompleted ? (
                  <Check size={14} color="white" />
                ) : isCurrent ? (
                  <MotiView
                    from={{ rotate: '0deg' }}
                    animate={{ rotate: '360deg' }}
                    transition={{ loop: true, type: 'timing', duration: 1000 }}
                  >
                    <Loader size={12} color="white" />
                  </MotiView>
                ) : null}
              </View>

              <AtelierTypography
                variant="h3"
                color={isCompleted ? 'white' : isCurrent ? 'white' : 'neutral'}
                className={isCurrent ? 'opacity-100' : 'opacity-60'}
              >
                {step.label}
              </AtelierTypography>

              {isCompleted && step.key !== 'DONE' && (
                <View className="ml-auto bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Check size={10} color="#10b981" />
                </View>
              )}
            </MotiView>
          );
        })}
      </MotiView>
    );
  };

  return (
    <View className="flex-1 bg-surface-lowest">
      <LinearGradient colors={['#0f172a', '#020617']} className="flex-1">
        <View
          className="flex-row items-center justify-between px-6 mb-4"
          style={{ marginTop: Platform.OS === 'ios' ? 60 : 40 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-white/10 rounded-full"
          >
            <X size={20} color="white" />
          </TouchableOpacity>
          <AtelierTypography variant="h2" color="white">
            Quét hóa đơn
          </AtelierTypography>
          <View className="w-10" />
        </View>

        {!image ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 px-6 justify-center"
          >
            <AtelierCard
              variant="elevated"
              className="bg-white/5 border border-white/10 p-8 items-center mb-10 overflow-hidden"
            >
              <View className="w-20 h-20 bg-primary/20 rounded-[32px] items-center justify-center mb-6">
                <Zap size={32} color={Colors.primary.DEFAULT} strokeWidth={2} />
              </View>
              <AtelierTypography variant="h2" color="white" className="text-center mb-2">
                Tầm nhìn AI
              </AtelierTypography>
              <AtelierTypography
                variant="body"
                color="white"
                className="text-center opacity-60 mb-8 leading-5"
              >
                Chụp ảnh hóa đơn rõ nét. Hệ thống AI sẽ tự động bóc tách số tiền, cửa hàng và các
                danh mục.
              </AtelierTypography>
              <View className="bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-500/30">
                <AtelierTypography variant="label" className="text-emerald-400 font-bold uppercase">
                  ⚡ OCR v3 + Healing Pro
                </AtelierTypography>
              </View>
            </AtelierCard>

            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                activeOpacity={0.8}
                className="bg-primary h-16 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-primary/25"
              >
                <Camera size={20} color="white" className="mr-3" />
                <AtelierTypography variant="h3" color="white">
                  Máy ảnh
                </AtelierTypography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage(false)}
                activeOpacity={0.8}
                className="bg-white/10 h-16 rounded-[24px] flex-row items-center justify-center"
              >
                <ImageIcon size={20} color="#94a3b8" className="mr-3" />
                <AtelierTypography variant="h3" color="white">
                  Thư viện ảnh
                </AtelierTypography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/transactions')}
                className="h-14 items-center justify-center"
              >
                <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase">
                  Nhập tay thay vì quét OCR
                </AtelierTypography>
              </TouchableOpacity>
            </View>
          </MotiView>
        ) : (
          <View className="flex-1 px-6">
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 rounded-[40px] overflow-hidden bg-black border border-white/10 relative"
            >
              <Image source={{ uri: image }} className="flex-1" resizeMode="contain" />

              {loading && (
                <MotiView
                  from={{ translateY: -100 }}
                  animate={{ translateY: 600 }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 2000,
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: Colors.primary.DEFAULT,
                    shadowColor: Colors.primary.DEFAULT,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 20,
                    elevation: 20,
                    zIndex: 20,
                  }}
                >
                  <LinearGradient
                    colors={['transparent', Colors.primary.DEFAULT, 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                  />
                </MotiView>
              )}

              {loading && renderStepIndicator()}
            </MotiView>

            <View className="py-10 space-y-4">
              <TouchableOpacity
                disabled={loading}
                onPress={uploadAndProcess}
                activeOpacity={0.9}
                className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-lg ${loading ? 'bg-neutral-800' : 'bg-primary shadow-primary/20'}`}
              >
                <AtelierTypography variant="h3" color="white" className="mr-3">
                  {loading ? 'Đang phân tích...' : 'Tiếp tục'}
                </AtelierTypography>
                {!loading && <ArrowRight size={20} color="white" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  resetState();
                  setImage(null);
                }}
                disabled={loading}
                className="h-12 items-center justify-center"
              >
                <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase">
                  Chụp lại ảnh khác
                </AtelierTypography>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
