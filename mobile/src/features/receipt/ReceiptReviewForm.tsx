import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Store, Tag, Wallet as WalletIcon, Check, ChevronLeft, AlertCircle, Brain, Shield } from 'lucide-react-native';
import apiClient from '../../services/api';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { formatVND, parseVND } from '../../utils/format';

export default function ReceiptReviewForm() {
  const { receiptId: rawReceiptId } = useLocalSearchParams();
  const receiptId = Array.isArray(rawReceiptId) ? rawReceiptId[0] : rawReceiptId;
  const { addMessage } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    walletId: 'default-wallet',
    categoryId: 'default-category',
    description: ''
  });

  useEffect(() => {
    fetchReceiptData();
  }, [receiptId]);

  const fetchReceiptData = async () => {
    try {
      const response = await apiClient.get(`/receipts/${receiptId}`);
      if (response.data.success) {
        const data = response.data.data;
        setFormData(prev => ({
          ...prev,
          storeName: data.storeName || '',
          amount: data.amount ? data.amount.toString() : '',
          transactionDate: data.transactionDate || new Date().toISOString()
        }));
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
    if (!formData.walletId || !formData.categoryId || !rawAmount) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn Ví và Danh mục.");
      return;
    }

    setSubmitting(true);
    const confirmUrl = `/receipts/${receiptId}/confirm`;
    console.log(`[OCR CONFIRM] Calling: ${confirmUrl}`, { walletId: formData.walletId, categoryId: formData.categoryId });
    
    try {
      const response = await apiClient.post(confirmUrl, {
        walletId: formData.walletId,
        categoryId: formData.categoryId,
        storeName: formData.storeName,
        amount: rawAmount,
        transactionDate: formData.transactionDate,
        description: formData.description
      });

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
                  // Chỉ cho phép nhập số
                  const cleanVal = val.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, amount: formatVND(cleanVal) });
                }}
                placeholder="0"
                keyboardType="numeric"
                className="text-white text-5xl font-bold text-center tracking-tighter"
                style={{ textShadowColor: 'rgba(59, 130, 246, 0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 }}
              />
              <View className="mt-2 py-1 px-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Text className="text-blue-400 font-bold tracking-widest uppercase text-xs">VNĐ</Text>
              </View>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <Store size={20} color="#3b82f6" className="mr-3" />
                <TextInput
                  value={formData.storeName}
                  onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                  placeholder="Tên cửa hàng"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-white text-base"
                />
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
              {/* Wallet & Category Pickers would go here - Mocking for now */}
              <TouchableOpacity className="flex-row items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <View className="flex-row items-center">
                  <WalletIcon size={20} color="#94a3b8" className="mr-3" />
                  <Text className="text-slate-400">Chọn Ví</Text>
                </View>
                <Text className="text-blue-400">Ví Chính</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <View className="flex-row items-center">
                  <Tag size={20} color="#94a3b8" className="mr-3" />
                  <Text className="text-slate-400">Chọn Danh mục</Text>
                </View>
                <Text className="text-blue-400">Ăn uống</Text>
              </TouchableOpacity>

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

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={submitting}
            className={`h-16 rounded-2xl flex-row items-center justify-center ${submitting ? 'bg-slate-800' : 'bg-blue-600'}`}
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
