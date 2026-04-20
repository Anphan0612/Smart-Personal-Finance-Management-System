import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Modal
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import {
  X,
  FileText,
  Check,
  Wallet,
  ArrowRight,
  Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { QuickCategorySelect, Category } from './components/QuickCategorySelect';
import { CustomKeypad } from './components/CustomKeypad';
import { WalletPicker } from './components/WalletPicker';
import { formatLiveCurrency, parseCurrency } from '@/utils/format';
import { useWallets } from '@/hooks/useWallets';
import { useAddTransaction } from '@/hooks/useTransactions';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ManualTransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type TransactionTab = 'EXPENSE' | 'INCOME';

export const ManualTransactionModal = ({ isVisible, onClose }: ManualTransactionModalProps) => {
  const [activeTab, setActiveTab] = useState<TransactionTab>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sourceWalletId, setSourceWalletId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const { data: wallets = [] } = useWallets();
  const { categories } = useAppStore();
  const addTransaction = useAddTransaction();

  // Filter categories based on active tab
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === activeTab);
  }, [categories, activeTab]);

  // Get selected wallet for balance checking
  const selectedWallet = wallets.find(w => w.id === sourceWalletId);

  // Check if expense exceeds wallet balance
  const isInsufficientBalance = useMemo(() => {
    if (activeTab !== 'EXPENSE' || !selectedWallet || !amount) return false;
    const amountValue = parseCurrency(amount);
    return amountValue > selectedWallet.balance;
  }, [activeTab, selectedWallet, amount]);

  // Derived styles based on tab from "The Financial Atelier" Design System
  const themeColor = useMemo(() => {
    switch (activeTab) {
      case 'INCOME': return '#006c49'; // Atelier Secondary
      case 'EXPENSE': return '#860842'; // Atelier Tertiary
      default: return '#171c1f'; // Atelier On-Surface
    }
  }, [activeTab]);

  const handleTabChange = (tab: TransactionTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTab(tab);
    // Reset selected category when switching tabs since categories are filtered by type
    setSelectedCategory(null);
  };

  const handleKeypadPress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount((prev) => {
      const newValue = prev + value;
      return formatLiveCurrency(newValue);
    });
  };

  const handleKeypadDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount((prev) => {
      if (prev.length === 0) return prev;
      const withoutFormatting = prev.replace(/\./g, '');
      const newValue = withoutFormatting.slice(0, -1);
      return formatLiveCurrency(newValue);
    });
  };

  const handleSave = async () => {
    if (!amount || !sourceWalletId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số tiền và chọn ví');
      return;
    }

    if (!selectedCategory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn danh mục cho giao dịch này');
      return;
    }

    try {
      const payload: any = {
        amount: parseCurrency(amount),
        type: activeTab,
        walletId: sourceWalletId,
        categoryId: selectedCategory?.id || null,
        description: note,
        transactionDate: new Date().toISOString(),
      };

      await addTransaction.mutateAsync(payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      setAmount('');
      setSelectedCategory(null);
      setNote('');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể lưu giao dịch.';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const [isModalMounted, setIsModalMounted] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsModalMounted(true);
    } else {
      const timer = setTimeout(() => setIsModalMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <Modal transparent visible={isModalMounted} animationType="none" onRequestClose={onClose}>
      <AnimatePresence>
      {isVisible && (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          
          {/* Backdrop */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onTouchStart={onClose}
          />

          {/* Modal Sheet */}
          <MotiView
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            exit={{ translateY: SCREEN_HEIGHT }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={styles.sheet}
          >
            {/* Grab Handle */}
            <View className="items-center pt-2 pb-4">
              <View className="w-12 h-1.5 bg-surface-container-highest rounded-full" />
            </View>

            <View className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }} // Add padding for fixed footer
              >
                {/* Header Section */}
                <View className="px-8 flex-row justify-between items-center mb-6">
                  <AtelierTypography variant="h2" className="text-xl font-manrope-extrabold text-surface-on">
                    Entry
                  </AtelierTypography>
                  <TouchableOpacity 
                    onPress={onClose} 
                    className="w-10 h-10 bg-surface-container-low rounded-full items-center justify-center shadow-sm"
                  >
                    <X size={20} color="#171c1f" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* Transaction Type Segmented Control - Premium Design */}
                <View className="px-8 mb-8">
                  <View className="flex-row bg-surface-container-low p-1 rounded-full h-[56px] shadow-sm">
                    {(['EXPENSE', 'INCOME'] as const).map((tab) => {
                      const isActive = activeTab === tab;
                      return (
                        <TouchableOpacity
                          key={tab}
                          onPress={() => handleTabChange(tab)}
                          className="flex-1 items-center justify-center flex-row relative"
                          activeOpacity={0.9}
                        >
                          <AnimatePresence>
                            {isActive && (
                              <MotiView
                                from={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'timing', duration: 250 }}
                                className="absolute inset-0 bg-white rounded-[18px] shadow-md border border-neutral-50"
                              />
                            )}
                          </AnimatePresence>
                          <AtelierTypography
                            variant="label"
                            className={`text-[11px] font-manrope-bold tracking-[1px] ${isActive ? 'text-surface-on' : 'text-surface-on-variant opacity-60'}`}
                          >
                            {tab === 'EXPENSE' ? 'CHI TIÊU' : 'THU NHẬP'}
                          </AtelierTypography>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                    {/* Amount Display - Enhanced and Prominent */}
                   <MotiView
                    animate={{ backgroundColor: themeColor + '08' }}
                    className="items-center py-16 mb-6"
                  >
                    <AtelierTypography variant="label" className="text-on-surface-variant mb-4 text-[10px] tracking-[2px] font-manrope-bold">
                      SỐ TIỀN
                    </AtelierTypography>
                    <View className="flex-row items-center justify-center w-full px-10">
                      <AtelierTypography variant="h2" className="text-4xl font-manrope-bold mr-2" style={{ color: themeColor }}>
                        {activeTab === 'EXPENSE' ? '-' : '+'}
                      </AtelierTypography>
                      <TextInput
                        className="text-6xl font-manrope-extrabold text-surface-on text-center p-0 m-0"
                        style={{ color: '#171c1f', minWidth: 120 }}
                        value={amount || '0'}
                        editable={false}
                      />
                      <AtelierTypography variant="h3" className="text-3xl font-manrope-bold text-on-surface-variant ml-2">
                        đ
                      </AtelierTypography>
                    </View>
                  </MotiView>

                   {/* Context Info (Wallet/Category) Grouped */}
                  <View className="px-8 pt-2 pb-2 gap-y-6">
                    {/* Wallet Group */}
                    <View className="space-y-3">
                      <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[2px]">
                         TÀI KHOẢN / VÍ
                      </AtelierTypography>
                      <WalletPicker
                        label=""
                        selectedId={sourceWalletId}
                        wallets={wallets}
                        onSelect={(w) => setSourceWalletId(w.id)}
                      />

                      {/* Insufficient Balance Warning */}
                      {isInsufficientBalance && (
                        <MotiView
                          from={{ opacity: 0, translateY: -10 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          className="flex-row items-center bg-error/10 p-3 rounded-2xl border border-error/20"
                        >
                          <Info size={16} color="#BA1A1A" className="mr-2" />
                          <AtelierTypography variant="caption" className="text-error text-[11px] flex-1">
                            Số dư không đủ ({new Intl.NumberFormat('vi-VN').format(selectedWallet?.balance || 0)} đ)
                          </AtelierTypography>
                        </MotiView>
                      )}
                    </View>

                    {/* Metadata Section (Notes) */}
                    <View className="space-y-3">
                        <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[2px]">
                           GHI CHÚ
                        </AtelierTypography>
                        <View className="flex-row items-center bg-surface-container-low rounded-[24px] px-5 h-16">
                           <FileText size={18} color="#434654" className="mr-3" />
                           <TextInput
                             placeholder="Thêm ghi chú (không bắt buộc)..."
                             className="flex-1 h-12 text-on-surface font-inter-medium text-sm"
                             value={note}
                             onChangeText={setNote}
                             placeholderTextColor="#737685"
                           />
                        </View>
                    </View>
                  </View>

                {/* Category Selection - Moved up for better hierarchy */}
                <View className="mb-6">
                  <QuickCategorySelect
                    selectedId={selectedCategory?.id || null}
                    categories={filteredCategories}
                    onSelect={setSelectedCategory}
                  />
                </View>

                {/* Integrated Design Keypad */}
                <View className="bg-surface-container-low/30 rounded-t-[40px] pt-4">
                  <CustomKeypad
                    onPress={handleKeypadPress}
                    onDelete={handleKeypadDelete}
                  />
                </View>
              </ScrollView>

              {/* Fixed Footer Actions - Strictly matching prototype */}
              <View 
                className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              >
                <View className="flex-row gap-x-4">
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 h-16 rounded-full bg-surface-container-high items-center justify-center shadow-sm"
                  >
                    <AtelierTypography variant="label" className="text-on-surface font-manrope-bold tracking-[1px]">
                      CANCEL
                    </AtelierTypography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={addTransaction.isPending}
                    activeOpacity={0.9}
                    className="flex-[2]"
                  >
                    <LinearGradient
                      colors={[activeTab === 'EXPENSE' ? '#ba1a1a' : themeColor, activeTab === 'EXPENSE' ? '#93000a' : themeColor + 'CC']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        height: 64,
                        borderRadius: 32,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: themeColor,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 15,
                        elevation: 6,
                      }}
                    >
                      <AtelierTypography variant="label" className="text-white text-xs font-manrope-extrabold uppercase tracking-widest">
                        {addTransaction.isPending ? 'Processing...' : 'Save Transaction'}
                      </AtelierTypography>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.4)', // Darker, more premium backdrop
  },
  sheet: {
    backgroundColor: '#f6fafe', // Atelier Surface Background
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.95,
    minHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: '#171c1f',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  }
});
