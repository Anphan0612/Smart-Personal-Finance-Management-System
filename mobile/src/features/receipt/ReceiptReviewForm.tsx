import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Store, Tag, Wallet as WalletIcon, Check, ChevronLeft, AlertCircle, Brain, Shield } from 'lucide-react-native';
import apiClient from '../../services/api';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { formatVND, parseVND } from '../../utils/format';
import { WalletPicker } from '../transactions/components/WalletPicker';
import { CategoryPicker } from '../transactions/components/CategoryPicker';
import * as Haptics from 'expo-haptics';
import { WalletResponse } from '../../types/api';

const MAX_POLLING_RETRIES = 5;

export default function ReceiptReviewForm() {
  const { receiptId: rawReceiptId } = useLocalSearchParams();
  const receiptId = Array.isArray(rawReceiptId) ? rawReceiptId[0] : rawReceiptId;
  const { 
    addMessage, 
    wallets, 
    categories, 
    refreshMetadata, 
    isMetadataLoading,
    activeWalletId 
  } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pollingRetries, setPollingRetries] = useState(0);
  const isLoadingRef = useRef(true);
  const [showCorrectionDetail, setShowCorrectionDetail] = useState(false);
  const [ocrMeta, setOcrMeta] = useState({
    confidence: 0,
    isCorrected: false,
    correctionReason: '',
  });
  const [formData, setFormData] = useState({
    storeName: '',
    amount: '',
    transactionDate: new Date().toISOString(),
    walletId: activeWalletId || '',
    categoryId: '',
    description: ''
  });
  const [aiValues, setAiValues] = useState({
    storeName: '',
    amount: '',
    categoryId: '',
    isMappedFromHistory: false
  });
  const [fieldEdited, setFieldEdited] = useState({
    storeName: false,
    amount: false,
    categoryId: false
  });
  const [validationErrors, setValidationErrors] = useState({
    walletId: false,
    categoryId: false,
    amount: false
  });
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wallets.length === 0 || categories.length === 0) {
      refreshMetadata();
    }
  }, []);

  // Sync activeWalletId to formData if it changes and formData.walletId is empty
  useEffect(() => {
    if (activeWalletId && !formData.walletId) {
      setFormData(prev => ({ ...prev, walletId: activeWalletId }));
    }
  }, [activeWalletId]);

  // Set default category if available
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      // Find 'Shopping' or 'Food' as a good default for receipts
      const defaultCat = categories.find(c => c.name.toLowerCase().includes('ăn') || c.name.toLowerCase().includes('shop')) || categories[0];
      setFormData(prev => ({ ...prev, categoryId: defaultCat.id }));
    }
  }, [categories]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleWalletSelect = useCallback((wallet: WalletResponse) => {
    setFormData(prev => ({ ...prev, walletId: wallet.id }));
    setValidationErrors(prev => ({ ...prev, walletId: false }));
  }, []);

  const handleCategorySelect = useCallback((category: { id: string; name: string; iconName: string }) => {
    setFormData(prev => ({ ...prev, categoryId: category.id }));
    setValidationErrors(prev => ({ ...prev, categoryId: false }));
    if (!fieldEdited.categoryId) {
      setFieldEdited(prev => ({ ...prev, categoryId: true }));
    }
  }, [fieldEdited.categoryId]);

  const pollWithDelay = async () => {
    if (!isLoadingRef.current) return;

    try {
      await fetchReceiptData();
      setPollingRetries(0);
      setTimeout(pollWithDelay, 3000);
    } catch (err) {
      console.log('Polling failure:', err);
      if (pollingRetries < MAX_POLLING_RETRIES) {
        setPollingRetries(prev => prev + 1);
        setTimeout(pollWithDelay, 5000 * (pollingRetries + 1));
      } else {
        setLoading(false);
        isLoadingRef.current = false;
        Alert.alert('Kết nối không ổn định', 'Không thể kết nối với máy chủ AI. Vui lòng thử lại sau.');
      }
    }
  };

  useEffect(() => {
    fetchReceiptData();
  }, [receiptId]);

  const fetchReceiptData = async () => {
    try {
      const response = await apiClient.get(`/receipts/${receiptId}`);
      if (response.data.success) {
        const data = response.data.data;
        const formattedAmount = data.amount ? formatVND(data.amount.toString()) : '';
        
        setFormData(prev => ({
          ...prev,
          storeName: data.storeName || '',
          amount: formattedAmount,
          transactionDate: data.transactionDate || new Date().toISOString(),
          categoryId: data.categoryId || prev.categoryId
        }));

        setAiValues({
          storeName: data.aiStoreName || data.storeName || '',
          amount: data.aiAmount ? formatVND(data.aiAmount.toString()) : formattedAmount,
          categoryId: data.aiCategoryId || data.categoryId || '',
          isMappedFromHistory: data.isMappedFromHistory || false
        });

        setOcrMeta({
          confidence: data.confidence || 0,
          isCorrected: data.isCorrected || false,
          correctionReason: data.correctionReason || '',
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const rawAmount = parseVND(formData.amount);

    const errors = {
      walletId: !formData.walletId,
      categoryId: !formData.categoryId,
      amount: !rawAmount
    };

    setValidationErrors(errors);

    if (errors.walletId || errors.categoryId || errors.amount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      return;
    }

    setSubmitting(true);
    const confirmUrl = `/receipts/${receiptId}/confirm`;

    try {
      const cleanAmount = formData.amount.replace(/[^0-9]/g, '');
      const payload = {
        walletId: formData.walletId,
        categoryId: formData.categoryId,
        storeName: formData.storeName,
        amount: parseInt(cleanAmount),
        transactionDate: formData.transactionDate,
        description: formData.description
      };

      const response = await apiClient.post(confirmUrl, payload);

      if (response.data.success) {
        addMessage({
          id: `ocr-success-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: 'assistant',
          content: `✅ Đã lưu hóa đơn từ **${formData.storeName || 'cửa hàng'}** thành công!\nSố tiền: **${formatVND(rawAmount)}**.\nGiao dịch đã được ghi nhận vào hệ thống.`,
          timestamp: Date.now()
        });

        Alert.alert("Thành công", "Giao dịch đã được lưu!");
        router.replace('/(tabs)/transactions');
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Xác nhận giao dịch thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.85) return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
    if (conf >= 0.65) return { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' };
    return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.85) return 'Cao';
    if (conf >= 0.65) return 'Trung bình';
    return 'Thấp';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator color="#3b82f6" />
        <Text className="text-slate-400 mt-4">Đang đồng bộ dữ liệu AI...</Text>
      </View>
    );
  }

  const confColors = getConfidenceColor(ocrMeta.confidence);

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <LinearGradient colors={['#0f172a', '#020617']} className="px-6 pt-12 pb-10">
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Kiểm tra thông tin</Text>
        </View>

        <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

          {/* AI Confidence Badge */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              gap: 12,
            }}
          >
            {/* Confidence Pill */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: confColors.bg,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: confColors.border,
            }}>
              <Shield size={14} color={confColors.text} style={{ marginRight: 6 }} />
              <Text style={{ color: confColors.text, fontSize: 13, fontWeight: '600' }}>
                AI Confidence: {(ocrMeta.confidence * 100).toFixed(0)}% — {getConfidenceLabel(ocrMeta.confidence)}
              </Text>
            </View>

            {/* AI Corrected Badge */}
            {ocrMeta.isCorrected && (
              <TouchableOpacity
                onPress={() => setShowCorrectionDetail(!showCorrectionDetail)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                }}
              >
                <Brain size={14} color="#60a5fa" style={{ marginRight: 6 }} />
                <Text style={{ color: '#60a5fa', fontSize: 13, fontWeight: '600' }}>
                  AI Sửa lỗi
                </Text>
              </TouchableOpacity>
            )}
          </MotiView>

          {/* Correction Detail (collapsible) */}
          {showCorrectionDetail && ocrMeta.correctionReason ? (
            <MotiView
              from={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: 1, scaleY: 1 }}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Brain size={16} color="#60a5fa" style={{ marginRight: 8 }} />
                <Text style={{ color: '#93c5fd', fontWeight: '700', fontSize: 14 }}>
                  Chi tiết sửa lỗi AI
                </Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20 }}>
                {ocrMeta.correctionReason}
              </Text>
            </MotiView>
          ) : null}

          {/* Main Info Card */}
          <View className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 mb-6">
            <View className="items-center mb-6">
              <Text className="text-slate-500 text-sm mb-1 uppercase tracking-widest">Số tiền</Text>
              <TextInput
                value={formData.amount}
                onChangeText={(val) => {
                  const cleanVal = val.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, amount: formatVND(parseInt(cleanVal || '0')) });
                  if (!fieldEdited.amount) setFieldEdited({ ...fieldEdited, amount: true });
                }}
                placeholder="0"
                keyboardType="numeric"
                className="text-white text-5xl font-bold text-center tracking-tighter"
                style={{ textShadowColor: 'rgba(59, 130, 246, 0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 }}
              />
              <View className="flex-row items-center mt-2 gap-2">
                <View className="py-1 px-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <Text className="text-blue-400 font-bold tracking-widest uppercase text-xs">VNĐ</Text>
                </View>
                {!fieldEdited.amount && (
                  <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} className="bg-yellow-500/10 p-1 rounded-full border border-yellow-500/20">
                    <Text className="text-[10px]">✨ AI</Text>
                  </MotiView>
                )}
              </View>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <Store size={20} color="#3b82f6" className="mr-3" />
                <TextInput
                  value={formData.storeName}
                  onChangeText={(val) => {
                    setFormData({ ...formData, storeName: val });
                    if (!fieldEdited.storeName) setFieldEdited({ ...fieldEdited, storeName: true });
                  }}
                  placeholder="Tên cửa hàng"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base"
                />
                {!fieldEdited.storeName && (
                  <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-row items-center bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                    <Text className="text-yellow-500 text-[10px] font-bold">✨ AI</Text>
                  </MotiView>
                )}
              </View>

              <View className="flex-row items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <Calendar size={20} color="#3b82f6" className="mr-3" />
                <Text className="text-white text-base">
                  {new Date(formData.transactionDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Setup Card */}
          <View className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 mb-8">
            <Text className="text-slate-400 font-bold mb-4">Chi tiết giao dịch</Text>

            <View className="space-y-4">
              {/* Wallet Picker */}
              <View>
                {validationErrors.walletId && (
                  <Text className="text-red-400 text-xs mb-2 px-1">Vui lòng chọn ví</Text>
                )}
                <WalletPicker
                  label="Chọn Ví"
                  selectedId={formData.walletId}
                  wallets={wallets}
                  onSelect={handleWalletSelect}
                />
              </View>

              {/* Category Picker */}
              <View>
                <View className="flex-row items-center justify-between mb-3 px-1">
                  <Text className="text-slate-400 font-bold">Danh mục</Text>
                  {aiValues.isMappedFromHistory && !fieldEdited.categoryId && (
                    <MotiView from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                      <Text className="text-green-500 text-[10px] font-bold">✨ THÓI QUEN</Text>
                    </MotiView>
                  )}
                </View>
                {validationErrors.categoryId && (
                  <Text className="text-red-400 text-xs mb-2 px-1">Vui lòng chọn danh mục</Text>
                )}
                <CategoryPicker
                  selectedId={formData.categoryId}
                  categories={categories}
                  isLoading={isMetadataLoading}
                  onSelect={handleCategorySelect}
                />
              </View>

              <TextInput
                value={formData.description}
                onChangeText={(val) => setFormData({ ...formData, description: val })}
                placeholder="Ghi chú thêm..."
                placeholderTextColor="#64748b"
                multiline
                className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-white min-h-[100px]"
              />
            </View>
          </View>

          {wallets.length === 0 && !isMetadataLoading && (
            <View className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-4 flex-row items-center">
              <AlertCircle size={18} color="#ef4444" className="mr-3" />
              <Text className="text-red-400 text-xs flex-1">
                Bạn chưa có ví nào. Vui lòng tạo ví trong phần Cài đặt trước khi lưu giao dịch.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={submitting || wallets.length === 0 || isMetadataLoading}
            className={`h-16 rounded-2xl flex-row items-center justify-center ${submitting || wallets.length === 0 || isMetadataLoading ? 'bg-slate-800' : 'bg-blue-600'}`}
            style={{ transform: [{ translateX: shakeAnimation }] }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Check size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Hoàn Tất & Lưu</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/transactions')}
            disabled={submitting}
            className="mt-4 h-12 items-center justify-center"
          >
            <Text className="text-slate-500 font-medium">Hủy bỏ & Quay về</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-6 py-2 px-4 bg-yellow-500/10 rounded-full border border-yellow-500/20">
            <AlertCircle size={14} color="#eab308" className="mr-2" />
            <Text className="text-yellow-500 text-xs">AI có thể nhận diện chưa chính xác, vui lòng kiểm tra lại</Text>
          </View>
        </MotiView>
      </LinearGradient>
    </ScrollView>
  );
}
