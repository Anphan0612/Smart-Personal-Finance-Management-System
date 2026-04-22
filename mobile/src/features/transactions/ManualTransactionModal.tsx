import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Modal,
  TextInput as RNTextInput
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
import { AtelierTypography, SkeletonBox } from '@/components/ui';
import { QuickCategorySelect, Category } from './components/QuickCategorySelect';
import { CategoryCreationModal } from './components/CategoryCreationModal';
import { CustomKeypad } from './components/CustomKeypad';
import { WalletPicker } from './components/WalletPicker';
import { formatLiveCurrency, parseCurrency } from '@/utils/format';
import { useWallets } from '@/hooks/useWallets';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import { useAddTransaction } from '@/hooks/useTransactions';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/tokens';
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
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const amountInputRef = useRef<RNTextInput>(null);

  const { data: wallets = [] } = useWallets();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const addTransaction = useAddTransaction();
  const createCategory = useCreateCategory();

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
      case 'INCOME': return Colors.secondary.DEFAULT;
      case 'EXPENSE': return Colors.error;
      default: return Colors.primary.DEFAULT;
    }
  }, [activeTab]);

  const handleTabChange = (tab: TransactionTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTab(tab);
    setSelectedCategory(null);
  };

  const handleAmountChange = (text: string) => {
    // Remove formatting to get raw number
    const cleanValue = text.replace(/[^0-9]/g, '');
    if (cleanValue === '') {
      setAmount('');
      return;
    }
    setAmount(formatLiveCurrency(cleanValue));
  };

  const handleSave = async () => {
    if (!amount || !sourceWalletId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số tiền và chọn ví');
      return;
    }

    const amountValue = parseCurrency(amount);

    // Validate amount is positive
    if (amountValue <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Số tiền không hợp lệ', 'Số tiền phải lớn hơn 0');
      return;
    }

    if (!selectedCategory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn danh mục cho giao dịch này');
      return;
    }

    try {
      const payload: any = {
        amount: amountValue,
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
      // UX Opt: Focus after sheet animation
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
      }, 600); // Wait for spring animation
      return () => clearTimeout(timer);
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
              <View className="w-12 h-1.2 bg-neutral-200 rounded-full" />
            </View>

            <View className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150 }} 
              >
                {/* Header Section */}
                <View className="px-8 flex-row justify-between items-center mb-6">
                  <AtelierTypography variant="h2" className="text-2xl text-neutral-900">
                    Ghi chép mới
                  </AtelierTypography>
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-10 h-10 bg-surface-container-low rounded-full items-center justify-center shadow-atelier-low"
                  >
                    <X size={20} color={Colors.neutral[900]} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* Transaction Type Segmented Control */}
                <View className="px-8 mb-8">
                  <View className="flex-row bg-surface-container-low p-1 rounded-full h-[56px] border border-neutral-100">
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
                                className="absolute inset-0 bg-white rounded-[24px] shadow-sm border border-neutral-100"
                              />
                            )}
                          </AnimatePresence>
                          <AtelierTypography
                            variant="label"
                            className={`text-[11px] font-bold tracking-[1px] ${isActive ? 'text-neutral-900' : 'text-neutral-400 opacity-60'}`}
                          >
                            {tab === 'EXPENSE' ? 'CHI TIÊU' : 'THU NHẬP'}
                          </AtelierTypography>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                    {/* Amount Display */}
                   <MotiView
                    animate={{ backgroundColor: themeColor + '08' }}
                    className="items-center py-12 mb-6"
                  >
                    <AtelierTypography variant="label" className="text-neutral-400 mb-4 tracking-[2px]">
                      SỐ TIỀN
                    </AtelierTypography>
                    <View className="flex-row items-center justify-center w-full px-10">
                      <AtelierTypography variant="h2" className="text-4xl mr-2" style={{ color: themeColor }}>
                        {activeTab === 'EXPENSE' ? '-' : '+'}
                      </AtelierTypography>
                      <RNTextInput
                        ref={amountInputRef}
                        className="text-6xl font-headline font-extrabold text-neutral-900 text-center p-0 m-0"
                        style={{ minWidth: 120 }}
                        value={amount}
                        placeholder="0"
                        placeholderTextColor={Colors.neutral[300]}
                        keyboardType="numeric"
                        onChangeText={handleAmountChange}
                        selectionColor={themeColor}
                      />
                      <AtelierTypography variant="h3" className="text-3xl text-neutral-400 ml-2">
                        đ
                      </AtelierTypography>
                    </View>
                  </MotiView>

                   {/* Context Info (Wallet/Category) Grouped */}
                  <View className="px-8 pt-2 pb-2 gap-y-8">
                    {/* Wallet Group */}
                    <View className="gap-y-3">
                      <AtelierTypography variant="label" className="text-neutral-400 ml-1 tracking-[2px]">
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
                          className="flex-row items-center bg-error/10 p-4 rounded-2xl border border-error/20"
                        >
                          <Info size={16} color={Colors.error} className="mr-2" />
                          <AtelierTypography variant="caption" className="text-error flex-1">
                            Số dư không đủ ({new Intl.NumberFormat('vi-VN').format(selectedWallet?.balance || 0)} đ)
                          </AtelierTypography>
                        </MotiView>
                      )}
                    </View>

                    {/* Note Section */}
                    <View className="gap-y-3">
                        <AtelierTypography variant="label" className="text-neutral-400 ml-1 tracking-[2px]">
                           GHI CHÚ
                        </AtelierTypography>
                        <View className="flex-row items-center bg-surface-container-low rounded-[24px] px-5 h-16 border border-neutral-100">
                           <FileText size={18} color={Colors.neutral[600]} className="mr-3" />
                           <TextInput
                             placeholder="Thêm ghi chú (không bắt buộc)..."
                             className="flex-1 h-12 text-neutral-900 font-body text-sm"
                             value={note}
                             onChangeText={setNote}
                             placeholderTextColor={Colors.neutral[400]}
                           />
                        </View>
                    </View>
                  </View>

                {/* Category Selection */}
                <View className="mt-8 mb-6">
                  <QuickCategorySelect
                    selectedId={selectedCategory?.id || null}
                    categories={filteredCategories}
                    onSelect={setSelectedCategory}
                    isLoading={isCategoriesLoading}
                    onAddPress={() => setIsCategoryModalVisible(true)}
                  />
                </View>

                 {/* Spacer for system keyboard */}
                 <View style={{ height: 100 }} />
              </ScrollView>

              {/* Fixed Footer Actions */}
              <View 
                className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-4 bg-white/90 border-t border-neutral-50"
              >
                <View className="flex-row gap-x-4">
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 h-16 rounded-full bg-neutral-100 items-center justify-center"
                  >
                    <AtelierTypography variant="label" className="text-neutral-900 tracking-[1px]">
                      HỦY
                    </AtelierTypography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={addTransaction.isPending || isInsufficientBalance}
                    activeOpacity={0.9}
                    className={`flex-[2] ${isInsufficientBalance ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <LinearGradient
                      colors={[themeColor, themeColor + 'EE']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="h-16 rounded-full flex-row items-center justify-center shadow-lg shadow-primary/20"
                      style={{ shadowColor: themeColor }}
                    >
                      <AtelierTypography variant="label" className="text-white text-xs font-bold uppercase tracking-widest">
                        {addTransaction.isPending ? 'Đang xử lý...' : 'Lưu giao dịch'}
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

    {/* Category Creation Modal */}
    <CategoryCreationModal
      isVisible={isCategoryModalVisible}
      onClose={() => setIsCategoryModalVisible(false)}
      transactionType={activeTab}
      onSubmit={async (name, iconName, type) => {
        await createCategory.mutateAsync({ name, iconName, type });
      }}
    />
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
    backgroundColor: 'rgba(23, 28, 31, 0.4)', 
  },
  sheet: {
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.95,
    minHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  }
});
