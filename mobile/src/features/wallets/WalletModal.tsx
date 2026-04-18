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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  walletToEdit?: WalletResponse | null;
}

const WALLET_TYPES: { type: WalletType; label: string; icon: any }[] = [
  { type: 'CASH', label: 'Tiền mặt', icon: Banknote },
  { type: 'BANK', label: 'Ngân hàng', icon: CreditCard },
  { type: 'EWALLET', label: 'Ví điện tử', icon: Smartphone },
  { type: 'INVESTMENT', label: 'Đầu tư', icon: LineChart },
];

export const WalletModal = ({ isVisible, onClose, walletToEdit }: WalletModalProps) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedType, setSelectedType] = useState<WalletType>('CASH');
  
  // Bank specific fields
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
        currencyCode: 'VND', // Default for now
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể lưu ví.';
      Alert.alert('Lỗi', errorMessage);
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
            style={styles.sheet}
          >
            <View className="items-center pt-2 pb-4">
              <View className="w-12 h-1.5 bg-surface-container-highest rounded-full" />
            </View>

            <View className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
              >
                <View className="px-8 flex-row justify-between items-center mb-6">
                  <AtelierTypography variant="h2" className="text-xl font-manrope-extrabold text-surface-on">
                    {walletToEdit ? 'Chỉnh sửa ví' : 'Thêm ví mới'}
                  </AtelierTypography>
                  <TouchableOpacity 
                    onPress={onClose} 
                    className="w-10 h-10 bg-surface-container-low rounded-full items-center justify-center shadow-sm"
                  >
                    <X size={20} color="#171c1f" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View className="px-8 gap-y-6">
                  {/* Name Input */}
                  <View className="space-y-2">
                    <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[2px]">
                       TÊN VÍ / TÀI KHOẢN
                    </AtelierTypography>
                    <View className="flex-row items-center bg-surface-container-low rounded-[24px] px-5 h-16 border border-outline/5">
                       <Wallet size={18} color="#005ab4" className="mr-3" />
                       <TextInput
                         placeholder="Ví dụ: Tiền tiết kiệm, MB Bank..."
                         className="flex-1 h-12 text-on-surface font-inter-medium text-sm"
                         value={name}
                         onChangeText={setName}
                         placeholderTextColor="#737685"
                       />
                    </View>
                  </View>

                  {/* Balance Input */}
                  <View className="space-y-2">
                    <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[2px]">
                       SỐ DƯ HIỆN TẠI
                    </AtelierTypography>
                    <View className="flex-row items-center bg-surface-container-low rounded-[24px] px-5 h-16 border border-outline/5">
                       <Banknote size={18} color="#006c49" className="mr-3" />
                       <TextInput
                         placeholder="0"
                         className="flex-1 h-12 text-on-surface font-manrope-bold text-lg"
                         value={balance}
                         onChangeText={handleBalanceChange}
                         keyboardType="numeric"
                         placeholderTextColor="#737685"
                       />
                       <AtelierTypography variant="h3" className="text-on-surface-variant ml-2">đ</AtelierTypography>
                    </View>
                  </View>

                  {/* Wallet Type Selection */}
                  <View className="space-y-3">
                    <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[2px]">
                       LOẠI TÀI KHOẢN
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
                            className={`flex-row items-center px-4 py-3 rounded-[20px] border ${isSelected ? 'bg-primary/5 border-primary' : 'bg-surface border-outline/10'}`}
                          >
                            <Icon size={16} color={isSelected ? '#005ab4' : '#737685'} className="mr-2" />
                            <AtelierTypography 
                              variant="label" 
                              className={`text-[12px] ${isSelected ? 'text-primary font-manrope-bold' : 'text-on-surface-variant'}`}
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
                        className="gap-y-4 pt-2"
                      >
                        <View className="p-4 bg-primary/5 rounded-[24px] border border-primary/10 flex-row items-center mb-2">
                          <Info size={16} color="#005ab4" className="mr-3" />
                          <AtelierTypography variant="caption" className="text-primary text-[11px] flex-1">
                            Vui lòng nhập thông tin ngân hàng để quản lý chính xác hơn.
                          </AtelierTypography>
                        </View>

                        <View className="space-y-2">
                          <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[1px]">
                             TÊN NGÂN HÀNG
                          </AtelierTypography>
                          <View className="bg-surface-container-low rounded-[20px] px-5 h-14 border border-outline/5 justify-center">
                             <TextInput
                               placeholder="VD: MB Bank, Techcombank..."
                               className="h-10 text-on-surface font-inter-medium text-sm"
                               value={bankName}
                               onChangeText={setBankName}
                               placeholderTextColor="#737685"
                             />
                          </View>
                        </View>

                        <View className="space-y-2">
                          <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[1px]">
                             SỐ TÀI KHOẢN
                          </AtelierTypography>
                          <View className="bg-surface-container-low rounded-[20px] px-5 h-14 border border-outline/5 justify-center">
                             <TextInput
                               placeholder="Nhập số tài khoản..."
                               className="h-10 text-on-surface font-manrope-bold text-sm"
                               value={accountNumber}
                               onChangeText={setAccountNumber}
                               keyboardType="number-pad"
                               placeholderTextColor="#737685"
                             />
                          </View>
                        </View>

                        <View className="space-y-2">
                          <AtelierTypography variant="label" className="text-on-surface-variant ml-4 text-[10px] tracking-[1px]">
                             CHI NHÁNH (TÙY CHỌN)
                          </AtelierTypography>
                          <View className="bg-surface-container-low rounded-[20px] px-5 h-14 border border-outline/5 justify-center">
                             <TextInput
                               placeholder="VD: Chi nhánh Hà Nội..."
                               className="h-10 text-on-surface font-inter-medium text-sm"
                               value={branch}
                               onChangeText={setBranch}
                               placeholderTextColor="#737685"
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
                className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-4"
                style={{ backgroundColor: 'rgba(246, 250, 254, 0.9)' }}
              >
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={createWallet.isPending || updateWallet.isPending}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#005ab4', '#003d9b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      height: 64,
                      borderRadius: 32,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#005ab4',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.2,
                      shadowRadius: 15,
                      elevation: 6,
                    }}
                  >
                    <Check size={20} color="#FFF" className="mr-2" strokeWidth={3} />
                    <AtelierTypography variant="label" className="text-white text-xs font-manrope-extrabold uppercase tracking-widest">
                      {createWallet.isPending || updateWallet.isPending ? 'Đang lưu...' : (walletToEdit ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới')}
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
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
  },
  sheet: {
    backgroundColor: '#f6fafe',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: '#171c1f',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  }
});
