import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Pressable
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft,
  Calendar,
  FileText,
  Check
} from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { AtelierButton } from '@/components/ui/AtelierButton';
import { CategoryPicker, Category } from './components/CategoryPicker';
import { WalletPicker } from './components/WalletPicker';
import { formatLiveCurrency, parseCurrency } from '@/utils/format';
import { useWallets } from '@/hooks/useWallets';
import { useAddTransaction } from '@/hooks/useTransactions';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ManualTransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type TransactionTab = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export const ManualTransactionModal = ({ isVisible, onClose }: ManualTransactionModalProps) => {
  const [activeTab, setActiveTab] = useState<TransactionTab>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sourceWalletId, setSourceWalletId] = useState<string | null>(null);
  const [destWalletId, setDestWalletId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  
  const { data: wallets = [] } = useWallets();
  const addTransaction = useAddTransaction();

  const themeColor = activeTab === 'INCOME' ? '#006C49' : activeTab === 'EXPENSE' ? '#BA1A1A' : '#003D9B';

  const handleTabChange = (tab: TransactionTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    // Reset destination wallet if switching away from transfer
    if (tab !== 'TRANSFER') setDestWalletId(null);
  };

  const handleSave = async () => {
    if (!amount || !sourceWalletId || (!selectedCategory && activeTab !== 'TRANSFER')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await addTransaction.mutateAsync({
        amount: parseCurrency(amount),
        type: activeTab,
        walletId: sourceWalletId,
        categoryId: selectedCategory?.id || '',
        description: note,
        transactionDate: new Date().toISOString(),
        destinationWalletId: destWalletId || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setNote('');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={styles.sheet}
          >
            {/* Grab Handle */}
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-neutral-200 rounded-full" />
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Header */}
              <View className="px-6 flex-row justify-between items-center mb-6">
                <AtelierTypography variant="h2" className="text-2xl">
                  Nhập giao dịch
                </AtelierTypography>
                <TouchableOpacity onPress={onClose} className="p-2 bg-neutral-100 rounded-full">
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Transaction Type Segmented Control */}
              <View className="px-6 mb-8">
                <View className="flex-row bg-surface-container-low p-1 rounded-2xl h-12">
                  {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => handleTabChange(tab)}
                      className={`flex-1 items-center justify-center rounded-xl flex-row gap-2`}
                    >
                      {activeTab === tab && (
                        <MotiView
                          layout={undefined}
                          className="absolute inset-0 bg-white rounded-xl shadow-sm border border-neutral-100"
                        />
                      )}
                      <AtelierTypography 
                        variant="label"
                        className={`text-xs font-bold ${activeTab === tab ? 'text-surface-on' : 'text-surface-on-variant'}`}
                      >
                        {tab === 'EXPENSE' ? 'Chi tiền' : tab === 'INCOME' ? 'Thu tiền' : 'Chuyển'}
                      </AtelierTypography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Amount Input Section */}
              <View className="px-6 mb-8 items-center">
                <AtelierTypography variant="label" className="text-surface-on-variant mb-2">
                  Số tiền
                </AtelierTypography>
                <View className="flex-row items-baseline">
                  <TextInput
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    className="text-5xl font-manrope-bold text-surface-on"
                    value={amount}
                    onChangeText={(val) => {
                      const formatted = formatLiveCurrency(val);
                      setAmount(formatted);
                    }}
                    autoFocus
                  />
                  <AtelierTypography variant="h3" className="text-2xl ml-2 text-neutral-400">
                    đ
                  </AtelierTypography>
                </View>
              </View>

              {/* Category Picker (Hidden for Transfer) */}
              {activeTab !== 'TRANSFER' && (
                <View className="px-6 mb-8">
                  <CategoryPicker 
                    selectedId={selectedCategory?.id || null} 
                    onSelect={setSelectedCategory} 
                  />
                </View>
              )}

              {/* Wallet Selectors */}
              <View className="px-6 gap-6 mb-8">
                <WalletPicker 
                  label={activeTab === 'TRANSFER' ? "Từ tài khoản" : "Tài khoản / Ví"}
                  selectedId={sourceWalletId}
                  wallets={wallets}
                  onSelect={(w) => setSourceWalletId(w.id)}
                />

                {activeTab === 'TRANSFER' && (
                  <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <WalletPicker 
                      label="Đến tài khoản"
                      selectedId={destWalletId}
                      wallets={wallets}
                      excludeId={sourceWalletId || undefined}
                      onSelect={(w) => setDestWalletId(w.id)}
                    />
                  </MotiView>
                )}
              </View>

              {/* Note / Date */}
              <View className="px-6 gap-6 mb-10">
                <View className="flex-row items-center bg-surface-container-low rounded-2xl px-4 py-3">
                  <Calendar size={18} color="#666" className="mr-3" />
                  <AtelierTypography variant="body" className="flex-1">
                    Ngày: {new Date().toLocaleDateString('vi-VN')}
                  </AtelierTypography>
                </View>

                <View className="flex-row items-center bg-surface-container-low rounded-2xl px-4 py-3">
                  <FileText size={18} color="#666" className="mr-3" />
                  <TextInput
                    placeholder="Ghi chú (không bắt buộc)"
                    className="flex-1 h-10 text-surface-on font-inter-regular"
                    value={note}
                    onChangeText={setNote}
                    placeholderTextColor="#ABACB2"
                  />
                </View>
              </View>

              {/* Save Button */}
              <View className="px-6">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={addTransaction.isPending}
                  activeOpacity={0.8}
                >
                  <MotiView
                    animate={{
                      backgroundColor: themeColor,
                      scale: addTransaction.isPending ? 0.98 : 1
                    }}
                    style={styles.saveButton}
                  >
                    {addTransaction.isPending ? (
                      <AtelierTypography variant="h3" className="text-white">
                        Đang lưu...
                      </AtelierTypography>
                    ) : (
                      <View className="flex-row items-center">
                        <AtelierTypography variant="h3" className="text-white text-lg font-bold mr-2">
                          Lưu giao dịch
                        </AtelierTypography>
                        <Check size={20} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                  </MotiView>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={onClose}
                  className="mt-4 h-12 items-center justify-center"
                >
                  <AtelierTypography variant="label" className="text-surface-on-variant">
                    Để sau
                  </AtelierTypography>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </MotiView>
        </KeyboardAvoidingView>
      )}
    </AnimatePresence>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  saveButton: {
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
