import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Zap, ArrowRight, Keyboard, Check, Loader } from 'lucide-react-native';
import { router } from 'expo-router';
import apiClient from '../../services/api';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams } from 'expo-router';

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
  const [hasInited, setHasInited] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (source && !hasInited) {
      setHasInited(true);
      pickImage(source === 'camera');
    }
  }, [source]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const simulateSteps = () => {
    setCurrentStep(0);
    setCompletedSteps([]);

    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step++;
      if (step < PROCESSING_STEPS.length - 1) {
        setCompletedSteps(prev => [...prev, PROCESSING_STEPS[step - 1].key]);
        setCurrentStep(step);
      } else {
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      }
    }, 1500);
  };

  const finishSteps = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    const allKeys = PROCESSING_STEPS.slice(0, -1).map(s => s.key);
    setCompletedSteps(allKeys);
    setCurrentStep(PROCESSING_STEPS.length - 1);
  };

  const compressImage = async (uri: string) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error("Compression error:", error);
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
        setLoading(true);
        const compressed = await compressImage(result.assets[0].uri);
        setImage(compressed);
        setLoading(false);
      } else if (!image) {
        router.back();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể truy cập camera hoặc thư viện ảnh.");
    }
  };

  const uploadAndProcess = async () => {
    if (!image) return;

    setLoading(true);
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

      finishSteps();

      if (response.data.success) {
        // Brief pause to show "Hoàn tất!" step
        setTimeout(() => {
          router.push({
            pathname: '/receipt/review',
            params: { receiptId: response.data.data.id }
          });
        }, 800);
      }
    } catch (error) {
      finishSteps();
      console.error("OCR Upload error:", error);
      Alert.alert(
        "Lỗi OCR",
        "Không thể tự động nhận diện hóa đơn này. Bạn có muốn nhập thủ công không?",
        [
          { text: "Thử lại", style: "cancel", onPress: () => resetState() },
          { text: "Nhập tay", onPress: () => router.push('/(tabs)/transactions') }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setCurrentStep(-1);
    setCompletedSteps([]);
    setLoading(false);
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
          paddingHorizontal: 20,
          paddingBottom: 16,
          paddingTop: 12,
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(2, 6, 23, 0.95)', 'rgba(2, 6, 23, 1)']}
          style={{
            position: 'absolute',
            top: -40,
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
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 6,
              }}
            >
              {/* Step icon */}
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isCompleted ? '#22c55e' : isCurrent ? '#3b82f6' : '#334155',
                marginRight: 12,
              }}>
                {isCompleted ? (
                  <Check size={14} color="white" />
                ) : isCurrent ? (
                  <MotiView
                    from={{ rotate: '0deg' }}
                    animate={{ rotate: '360deg' }}
                    transition={{ loop: true, type: 'timing', duration: 1000 }}
                  >
                    <Loader size={14} color="white" />
                  </MotiView>
                ) : null}
              </View>

              {/* Step text */}
              <Text style={{
                color: isCompleted ? '#86efac' : isCurrent ? '#93c5fd' : '#64748b',
                fontSize: 14,
                fontWeight: isCurrent ? '600' : '400',
              }}>
                {step.icon} {step.label}
              </Text>

              {/* Duration badge */}
              {isCompleted && step.key !== 'DONE' && (
                <View style={{
                  marginLeft: 'auto',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                }}>
                  <Text style={{ color: '#4ade80', fontSize: 11 }}>✓</Text>
                </View>
              )}
            </MotiView>
          );
        })}
      </MotiView>
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#0f172a', '#020617']}
        className="flex-1 px-6 pt-12"
      >
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Quét Hóa Đơn</Text>
          <View style={{ width: 24 }} />
        </View>

        {!image ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 justify-center items-center"
          >
            <View className="w-full aspect-square bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-700 justify-center items-center mb-12">
              <Zap size={48} color="#3b82f6" strokeWidth={1.5} />
              <Text className="text-slate-400 mt-4 text-center px-8">
                Chụp ảnh rõ nét hóa đơn để AI tự động phân loại chi tiêu
              </Text>
              <View className="flex-row items-center mt-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-400 text-xs font-medium">
                  ⚡ PaddleOCR v3 + AI Healing
                </Text>
              </View>
            </View>

            <View className="w-full space-y-4">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                className="bg-blue-600 h-16 rounded-2xl flex-row items-center justify-center"
              >
                <Camera size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Chụp Ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage(false)}
                className="bg-slate-800 h-16 rounded-2xl flex-row items-center justify-center"
              >
                <ImageIcon size={20} color="#94a3b8" className="mr-2" />
                <Text className="text-slate-200 font-bold text-lg">Chọn Từ Thư Viện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/transactions')}
                className="h-12 flex-row items-center justify-center"
              >
                <Keyboard size={18} color="#64748b" className="mr-2" />
                <Text className="text-slate-500 font-medium">Nhập tay thay vì quét OCR</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        ) : (
          <View className="flex-1">
            <View className="flex-1 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative">
              <Image source={{ uri: image }} className="flex-1" resizeMode="contain" />

              {/* Scanning Line Animation */}
              {loading && (
                <MotiView
                  from={{ translateY: 0 }}
                  animate={{ translateY: 600 }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 2500,
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: '#3b82f6',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 15,
                    elevation: 15,
                    zIndex: 20,
                  }}
                >
                  <LinearGradient
                    colors={['transparent', '#3b82f6', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                  />
                </MotiView>
              )}

              {/* Step-by-step Processing Status */}
              {loading && renderStepIndicator()}
            </View>

            <View className="py-8 space-y-4">
              <TouchableOpacity
                disabled={loading}
                onPress={uploadAndProcess}
                className={`h-16 rounded-2xl flex-row items-center justify-center ${loading ? 'bg-slate-800' : 'bg-blue-600'}`}
              >
                <Text className="text-white font-bold text-lg mr-2">
                  {loading ? 'Đang xử lý...' : 'Tiếp Tục'}
                </Text>
                {!loading && <ArrowRight size={20} color="white" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { resetState(); setImage(null); }}
                disabled={loading}
                className="h-12 items-center justify-center"
              >
                <Text className="text-slate-400 font-medium">Chụp lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
