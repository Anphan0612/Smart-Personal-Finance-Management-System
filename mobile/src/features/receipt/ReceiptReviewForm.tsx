import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Store, Tag, Wallet as WalletIcon, Check, ChevronLeft, AlertCircle, Brain, Shield, Info } from 'lucide-react-native';
import apiClient from '../../services/api';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { formatVND, parseVND } from '../../utils/format';
import { WalletPicker } from '../transactions/components/WalletPicker';
import { CategoryPicker } from '../transactions/components/CategoryPicker';
import * as Haptics from 'expo-haptics';
import { WalletResponse } from '../../types/api';
import { 
  AtelierTypography, 
  AtelierCard 
} from "@/components/ui";
import { Colors } from "@/constants/tokens";

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

  useEffect(() => {
    if (activeWalletId && !formData.walletId) {
      setFormData(prev => ({ ...prev, walletId: activeWalletId }));
    }
  }, [activeWalletId]);

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
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

      const response = await apiClient.post(`/receipts/${receiptId}/confirm`, payload);
      if (response.data.success) {
        addMessage({
          id: `ocr-success-${Date.now()}`,
          role: 'assistant',
          content: `✅ Đã lưu hóa đơn từ **${formData.storeName || 'cửa hàng'}** thành công!\nSố tiền: **${formatVND(rawAmount)}**.`,
          timestamp: Date.now()
        });
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
    if (conf >= 0.85) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    if (conf >= 0.65) return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface-lowest justify-center items-center">
        <ActivityIndicator color={Colors.primary.DEFAULT} />
        <AtelierTypography variant="body" className="mt-4 opacity-60">Đang đồng bộ dữ liệu AI...</AtelierTypography>
      </View>
    );
  }

  const confStyles = getConfidenceColor(ocrMeta.confidence);

  return (
    <View className="flex-1 bg-surface-lowest">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#f8fafc', '#ffffff']} className="px-6 pt-16 pb-32">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="mr-4 w-10 h-10 items-center justify-center bg-white border border-neutral-100 rounded-full shadow-sm"
            >
              <ChevronLeft size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            <AtelierTypography variant="h1">Kiểm tra AI</AtelierTypography>
          </View>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
            {/* Confidence & Correction Badges */}
            <View className="flex-row items-center justify-center gap-3 mb-6">
              <View className={`${confStyles.bg} ${confStyles.border} border px-4 py-2 rounded-full flex-row items-center`}>
                <Shield size={14} color={confStyles.text.replace('text-', '')} className="mr-2" />
                <AtelierTypography variant="label" className={`${confStyles.text} font-bold`}>
                  ĐỘ TIN CẬY: {(ocrMeta.confidence * 100).toFixed(0)}%
                </AtelierTypography>
              </View>

              {ocrMeta.isCorrected && (
                <TouchableOpacity
                  onPress={() => setShowCorrectionDetail(!showCorrectionDetail)}
                  className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-full flex-row items-center"
                >
                  <Brain size={14} color={Colors.primary.DEFAULT} className="mr-2" />
                  <AtelierTypography variant="label" color="primary" className="font-bold">AI ĐÃ TỰ SỬA</AtelierTypography>
                </TouchableOpacity>
              )}
            </View>

            {showCorrectionDetail && ocrMeta.correctionReason && (
              <MotiView from={{ opacity: 0, scaleY: 0.8 }} animate={{ opacity: 1, scaleY: 1 }} className="mb-6">
                <AtelierCard variant="elevated" className="bg-primary/5 border border-primary/10">
                  <View className="flex-row items-center mb-2">
                    <Info size={14} color={Colors.primary.DEFAULT} className="mr-2" />
                    <AtelierTypography variant="h3" color="primary">Chi tiết sửa lỗi</AtelierTypography>
                  </View>
                  <AtelierTypography variant="body" className="opacity-70 leading-5">
                    {ocrMeta.correctionReason}
                  </AtelierTypography>
                </AtelierCard>
              </MotiView>
            )}

            {/* Main Info Card */}
            <AtelierCard padding="lg" className="bg-white border border-neutral-100 shadow-atelier-low mb-6">
              <View className="items-center mb-8">
                <AtelierTypography variant="label" className="text-neutral-400 uppercase tracking-widest mb-2">Số tiền hóa đơn</AtelierTypography>
                <View className="flex-row items-baseline justify-center">
                  <TextInput
                    value={formData.amount}
                    onChangeText={(val) => {
                      const cleanVal = val.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, amount: formatVND(parseInt(cleanVal || '0')) });
                      if (!fieldEdited.amount) setFieldEdited({ ...fieldEdited, amount: true });
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                    className="text-5xl font-bold tracking-tighter text-primary"
                  />
                  <AtelierTypography variant="h2" className="ml-2 text-primary opacity-50">đ</AtelierTypography>
                </View>
                {!fieldEdited.amount && (
                  <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <AtelierTypography variant="label" className="text-amber-600 font-bold">✨ AI TRÍCH XUẤT</AtelierTypography>
                  </MotiView>
                )}
              </View>

              <View className="space-y-4">
                <View className="flex-row items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <Store size={20} color={Colors.neutral[400]} className="mr-4" />
                  <TextInput
                    value={formData.storeName}
                    onChangeText={(val) => {
                      setFormData({ ...formData, storeName: val });
                      if (!fieldEdited.storeName) setFieldEdited({ ...fieldEdited, storeName: true });
                    }}
                    placeholder="Tên cửa hàng"
                    placeholderTextColor={Colors.neutral[300]}
                    className="flex-1 text-lg font-bold text-neutral-800"
                  />
                  {!fieldEdited.storeName && (
                    <AtelierTypography variant="label" className="text-amber-500 font-bold ml-2">AI✨</AtelierTypography>
                  )}
                </View>

                <View className="flex-row items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <Calendar size={20} color={Colors.neutral[400]} className="mr-4" />
                  <AtelierTypography variant="h3" className="flex-1">
                    {new Date(formData.transactionDate).toLocaleDateString('vi-VN', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </AtelierTypography>
                </View>
              </View>
            </AtelierCard>

            {/* Transaction Settings */}
            <View className="space-y-6 mb-8">
              <View>
                <AtelierTypography variant="h2" className="text-lg px-1 mb-3">Tài khoản & Danh mục</AtelierTypography>
                <AtelierCard padding="none" className="bg-white border border-neutral-100 shadow-atelier-low overflow-hidden">
                   <View className="p-4 border-b border-neutral-50">
                    <WalletPicker
                      label="Nguồn tiền"
                      selectedId={formData.walletId}
                      wallets={wallets}
                      onSelect={handleWalletSelect}
                    />
                    {validationErrors.walletId && (
                      <AtelierTypography variant="label" className="text-red-500 mt-2 ml-1">Vui lòng chọn ví thanh toán</AtelierTypography>
                    )}
                   </View>
                   <View className="p-4">
                    <View className="flex-row items-center justify-between mb-3 px-1">
                      <AtelierTypography variant="h3">Danh mục</AtelierTypography>
                      {aiValues.isMappedFromHistory && !fieldEdited.categoryId && (
                        <MotiView from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                          <AtelierTypography variant="label" className="text-emerald-500 font-bold">G gợi ý✨</AtelierTypography>
                        </MotiView>
                      )}
                    </View>
                    <CategoryPicker
                      selectedId={formData.categoryId}
                      categories={categories}
                      isLoading={isMetadataLoading}
                      onSelect={handleCategorySelect}
                    />
                    {validationErrors.categoryId && (
                      <AtelierTypography variant="label" className="text-red-500 mt-2 ml-1">Vui lòng chọn danh mục chi tiêu</AtelierTypography>
                    )}
                   </View>
                </AtelierCard>
              </View>

              <View>
                <AtelierTypography variant="h2" className="text-lg px-1 mb-3">Ghi chú</AtelierTypography>
                <TextInput
                  value={formData.description}
                  onChangeText={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Thêm mô tả cho giao dịch này..."
                  placeholderTextColor={Colors.neutral[300]}
                  multiline
                  className="bg-white p-5 rounded-3xl border border-neutral-100 text-neutral-800 min-h-[120px] shadow-atelier-low text-base"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-4" style={{ transform: [{ translateX: shakeAnimation }] }}>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={submitting || wallets.length === 0 || isMetadataLoading}
                activeOpacity={0.9}
                className={`h-16 rounded-[28px] flex-row items-center justify-center shadow-xl ${submitting || wallets.length === 0 || isMetadataLoading ? 'bg-neutral-300' : 'bg-primary shadow-primary/20'}`}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Check size={20} color="white" className="mr-3" />
                    <AtelierTypography variant="h2" color="white">Hoàn tất & Lưu</AtelierTypography>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/(tabs)/transactions')}
                disabled={submitting}
                className="h-14 items-center justify-center"
              >
                <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase">Hủy bỏ</AtelierTypography>
              </TouchableOpacity>
            </View>

            <View className="mt-10 flex-row items-center justify-center px-6 py-4 bg-amber-500/5 rounded-3xl border border-amber-500/10 mb-20">
              <AlertCircle size={16} color={Colors.warning} className="mr-3" />
              <AtelierTypography variant="caption" className="text-amber-600 flex-1 leading-4">
                AI có thể nhận diện chưa chính xác, nhất là với chữ viết tay. Vui lòng kiểm tra lại trước khi lưu.
              </AtelierTypography>
            </View>
          </MotiView>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}
