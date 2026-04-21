import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  Modal
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import {
  X,
  Wallet,
  CreditCard,
  Smartphone,
  LineChart,
  Banknote,
  Info,
  Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { WalletResponse, WalletType } from '@/types/api';
import { useCreateWallet, useUpdateWallet } from '@/hooks/useWallets';
import * as Haptics from 'expo-haptics';
import { formatLiveCurrency, parseCurrency } from '@/utils/format';
import { Colors } from '@/constants/tokens';
import { handleApiError } from '@/utils/error';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  walletToEdit?: WalletResponse | null;
}

const WALLET_TYPES: { type: WalletType; label: string; icon: any; color: string }[] = [
  { type: 'CASH', label: 'Tiền mặt', icon: Banknote, color: '#10b981' },
  { type: 'BANK', label: 'Ngân hàng', icon: CreditCard, color: '#3b82f6' },
  { type: 'EWALLET', label: 'Ví điện tử', icon: Smartphone, color: '#f59e0b' },
  { type: 'INVESTMENT', label: 'Đầu tư', icon: LineChart, color: '#8b5cf6' },
];

export const WalletModal = ({ isVisible, onClose, walletToEdit }: WalletModalProps) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedType, setSelectedType] = useState<WalletType>('CASH');
  
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');

  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setBalance(new Intl.NumberFormat('vi-VN').format(walletToEdit.balance));
      setSelectedType(walletToEdit.type);
      setBankName(walletToEdit.bankName || '');
      setAccountNumber(walletToEdit.accountNumber || '');
      setBranch(walletToEdit.branch || '');
    } else {
      setName('');
      setBalance('');
      setSelectedType('CASH');
      setBankName('');
      setAccountNumber('');
      setBranch('');
    }
  }, [walletToEdit, isVisible]);

  const handleSave = async () => {
    if (!name || !balance) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên ví và số dư hiện tại');
      return;
    }

    if (selectedType === 'BANK' && (!bankName || !accountNumber)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Thiếu thông tin', 'Tài khoản ngân hàng cần có tên ngân hàng và số tài khoản');
      return;
    }

    try {
      const payload: any = {
        name,
        balance: parseCurrency(balance),
        type: selectedType,
        currencyCode: 'VND',
        bankName: selectedType === 'BANK' ? bankName : null,
        accountNumber: selectedType === 'BANK' ? accountNumber : null,
        branch: selectedType === 'BANK' ? branch : null,
      };

      if (walletToEdit) {
        await updateWallet.mutateAsync({ id: walletToEdit.id, data: payload });
      } else {
        await createWallet.mutateAsync(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error: any) {
      handleApiError(error, 'Lỗi', 'Không thể lưu ví.');
    }
  };

  const handleBalanceChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setBalance(formatLiveCurrency(numeric));
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
          
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onTouchStart={onClose}
          />

          <MotiView
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            exit={{ translateY: SCREEN_HEIGHT }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={[styles.sheet, { backgroundColor: Colors.surface.card }]}
          >
            <View className="items-center pt-2 pb-4">
              <View className="w-12 h-1.5 bg-neutral-100 rounded-full" />
            </View>

            <View className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150 }}
              >
                <View className="px-8 flex-row justify-between items-center mb-10">
                  <AtelierTypography variant="h1" className="text-2xl">
                    {walletToEdit ? 'Chỉnh sửa ví' : 'Thêm ví mới'}
                  </AtelierTypography>
                  <TouchableOpacity 
                    onPress={onClose} 
                    className="w-12 h-12 bg-white border border-neutral-100 rounded-full items-center justify-center shadow-atelier-low"
                  >
                    <X size={20} color={Colors.neutral[600]} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View className="px-8 gap-y-8">
                  {/* Name Input */}
                  <View className="space-y-3">
                    <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase tracking-widest ml-1">
                       TÊN TÀI KHOẢN
                    </AtelierTypography>
                    <View className="flex-row items-center bg-white rounded-[28px] px-6 h-18 border border-neutral-100 shadow-atelier-low">
                       <Wallet size={20} color={Colors.primary.DEFAULT} className="mr-4" />
                       <TextInput
                         placeholder="Ví dụ: Tiền tiết kiệm, MB Bank..."
                         className="flex-1 h-14 text-neutral-800 font-bold text-base"
                         value={name}
                         onChangeText={setName}
                         placeholderTextColor={Colors.neutral[300]}
                       />
                    </View>
                  </View>

                  {/* Balance Input */}
                  <View className="space-y-3">
                    <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase tracking-widest ml-1">
                       SỐ DƯ BAN ĐẦU
                    </AtelierTypography>
                    <View className="flex-row items-center bg-white rounded-[28px] px-6 h-18 border border-neutral-100 shadow-atelier-low">
                       <Banknote size={20} color="#10b981" className="mr-4" />
                       <TextInput
                         placeholder="0"
                         className="flex-1 h-14 text-neutral-900 font-bold text-2xl"
                         value={balance}
                         onChangeText={handleBalanceChange}
                         keyboardType="numeric"
                         placeholderTextColor={Colors.neutral[300]}
                       />
                       <AtelierTypography variant="h3" className="text-neutral-300 ml-2">đ</AtelierTypography>
                    </View>
                  </View>

                  {/* Wallet Type Selection */}
                  <View className="space-y-4">
                    <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase tracking-widest ml-1">
                       PHÂN LOẠI
                    </AtelierTypography>
                    <View className="flex-row flex-wrap gap-3">
                      {WALLET_TYPES.map((item) => {
                        const isSelected = selectedType === item.type;
                        const Icon = item.icon;
                        return (
                          <TouchableOpacity
                            key={item.type}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setSelectedType(item.type);
                            }}
                            className={`flex-row items-center px-5 py-4 rounded-[24px] border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-neutral-100 shadow-atelier-low'}`}
                          >
                            <Icon size={18} color={isSelected ? 'white' : Colors.neutral[400]} className="mr-2" />
                            <AtelierTypography 
                              variant="label" 
                              className={`font-bold ${isSelected ? 'text-white' : 'text-neutral-600'}`}
                            >
                              {item.label}
                            </AtelierTypography>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Bank Specific Fields - Animated Appearance */}
                  <AnimatePresence>
                    {selectedType === 'BANK' && (
                      <MotiView
                        from={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="gap-y-6 pt-4"
                      >
                        <View className="p-5 bg-blue-50/50 rounded-[28px] border border-blue-100 flex-row items-center">
                          <Info size={16} color={Colors.primary.DEFAULT} className="mr-3" />
                          <AtelierTypography variant="caption" className="text-primary flex-1 leading-4">
                            Thông tin này giúp bạn quản lý tài khoản ngân hàng chi tiết hơn.
                          </AtelierTypography>
                        </View>

                        <View className="space-y-2">
                          <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase tracking-widest ml-1">
                             TÊN NGÂN HÀNG
                          </AtelierTypography>
                          <View className="bg-white rounded-[24px] px-6 h-16 border border-neutral-100 shadow-atelier-low justify-center">
                             <TextInput
                               placeholder="VD: MB Bank, Techcombank..."
                               className="h-10 text-neutral-800 font-bold text-base"
                               value={bankName}
                               onChangeText={setBankName}
                               placeholderTextColor={Colors.neutral[300]}
                             />
                          </View>
                        </View>

                        <View className="space-y-2">
                          <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase tracking-widest ml-1">
                             SỐ TÀI KHOẢN
                          </AtelierTypography>
                          <View className="bg-white rounded-[24px] px-6 h-16 border border-neutral-100 shadow-atelier-low justify-center">
                             <TextInput
                               placeholder="Nhập số tài khoản..."
                               className="h-10 text-neutral-800 font-bold text-base"
                               value={accountNumber}
                               onChangeText={setAccountNumber}
                               keyboardType="number-pad"
                               placeholderTextColor={Colors.neutral[300]}
                             />
                          </View>
                        </View>

                        <View className="space-y-2">
                          <AtelierTypography variant="label" className="text-neutral-400 font-bold uppercase tracking-widest ml-1">
                             CHI NHÁNH
                          </AtelierTypography>
                          <View className="bg-white rounded-[24px] px-6 h-16 border border-neutral-100 shadow-atelier-low justify-center">
                             <TextInput
                               placeholder="Không bắt buộc..."
                               className="h-10 text-neutral-800 font-bold text-base"
                               value={branch}
                               onChangeText={setBranch}
                               placeholderTextColor={Colors.neutral[300]}
                             />
                          </View>
                        </View>
                      </MotiView>
                    )}
                  </AnimatePresence>
                </View>
              </ScrollView>

              {/* Footer */}
              <View 
                className="absolute bottom-0 left-0 right-0 px-8 pb-12 pt-6 border-t border-neutral-50 bg-white"
              >
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={createWallet.isPending || updateWallet.isPending}
                  activeOpacity={0.9}
                  className="shadow-xl shadow-primary/25"
                >
                  <LinearGradient
                    colors={[Colors.primary.DEFAULT, '#004da3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-16 rounded-[28px] flex-row items-center justify-center"
                  >
                    <Check size={20} color="#FFF" className="mr-3" strokeWidth={3} />
                    <AtelierTypography variant="h2" color="white">
                      {createWallet.isPending || updateWallet.isPending ? 'Đang lưu...' : (walletToEdit ? 'Cập nhật tài khoản' : 'Thêm tài khoản')}
                    </AtelierTypography>
                  </LinearGradient>
                </TouchableOpacity>
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
    zIndex: 10001,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 30,
  }
});
