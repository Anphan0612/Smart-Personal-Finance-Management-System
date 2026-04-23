import React from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, ScrollView, Modal } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import {
  X,
  Plus,
  Edit2,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
  LineChart,
} from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { WalletResponse } from '@/types/api';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WalletSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  wallets: WalletResponse[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (wallet: WalletResponse) => void;
}

export const WalletSelectionModal = ({
  isVisible,
  onClose,
  wallets,
  activeId,
  onSelect,
  onAdd,
  onEdit,
}: WalletSelectionModalProps) => {
  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return CreditCard;
      case 'CASH':
        return Banknote;
      case 'EWALLET':
        return Smartphone;
      case 'INVESTMENT':
        return LineChart;
      default:
        return Banknote;
    }
  };

  const [isModalMounted, setIsModalMounted] = React.useState(isVisible);

  React.useEffect(() => {
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

              <View className="px-8 flex-row justify-between items-center mb-8">
                <AtelierTypography variant="h1" className="text-2xl">
                  Tài khoản của tôi
                </AtelierTypography>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-12 h-12 bg-white border border-neutral-100 rounded-full items-center justify-center shadow-atelier-low"
                >
                  <X size={20} color={Colors.neutral[600]} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
              >
                <View className="gap-y-4">
                  {wallets.map((wallet) => {
                    const isActive = activeId === wallet.id;
                    const Icon = getWalletIcon(wallet.type);

                    return (
                      <MotiView
                        key={wallet.id}
                        animate={{
                          backgroundColor: isActive ? 'white' : 'white',
                          borderColor: isActive ? Colors.primary.DEFAULT : Colors.neutral[50],
                        }}
                        className={`p-5 rounded-[32px] border ${isActive ? 'border-2' : 'border-neutral-50'} flex-row items-center shadow-atelier-low`}
                      >
                        <TouchableOpacity
                          className="flex-1 flex-row items-center"
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onSelect(wallet.id);
                            onClose();
                          }}
                        >
                          <View
                            className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${isActive ? 'bg-primary' : 'bg-neutral-50'}`}
                          >
                            <Icon size={24} color={isActive ? 'white' : Colors.neutral[500]} />
                          </View>
                          <View className="flex-1">
                            <AtelierTypography variant="h3" className="text-base font-bold">
                              {wallet.name}
                            </AtelierTypography>
                            <AtelierTypography
                              variant="caption"
                              className="text-neutral-400 mt-0.5"
                            >
                              {wallet.type === 'BANK'
                                ? `${wallet.bankName || 'Ngân hàng'} • ****${wallet.accountNumber?.slice(-4) || 'N/A'}`
                                : wallet.type}
                            </AtelierTypography>
                            <AtelierTypography
                              variant="label"
                              color="primary"
                              className="font-bold text-base mt-1"
                            >
                              {new Intl.NumberFormat('vi-VN').format(wallet.balance)} đ
                            </AtelierTypography>
                          </View>
                          {isActive && (
                            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2">
                              <Check size={16} color={Colors.primary.DEFAULT} strokeWidth={3} />
                            </View>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onEdit(wallet);
                          }}
                          className="w-12 h-12 items-center justify-center rounded-full bg-neutral-50 ml-2"
                        >
                          <Edit2 size={18} color={Colors.neutral[400]} />
                        </TouchableOpacity>
                      </MotiView>
                    );
                  })}

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onAdd();
                    }}
                    className="flex-row items-center justify-center p-6 border-2 border-dashed border-blue-100/50 bg-blue-50/20 rounded-[32px] mt-4"
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                      <Plus size={20} color={Colors.primary.DEFAULT} strokeWidth={3} />
                    </View>
                    <AtelierTypography
                      variant="label"
                      className="text-primary font-bold uppercase tracking-widest"
                    >
                      Thêm tài khoản
                    </AtelierTypography>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    zIndex: 10002,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.75,
    minHeight: SCREEN_HEIGHT * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 30,
  },
});
