import React from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import {
  X,
  Plus,
  Edit2,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
  LineChart
} from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { WalletResponse } from '@/types/api';
import * as Haptics from 'expo-haptics';

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
  onEdit
}: WalletSelectionModalProps) => {
  
  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'BANK': return CreditCard;
      case 'CASH': return Banknote;
      case 'EWALLET': return Smartphone;
      case 'INVESTMENT': return LineChart;
      default: return Banknote;
    }
  };

  return (
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
            style={styles.sheet}
          >
            <View className="items-center pt-2 pb-4">
              <View className="w-12 h-1.5 bg-surface-container-highest rounded-full" />
            </View>

            <View className="px-8 flex-row justify-between items-center mb-6">
              <AtelierTypography variant="h2" className="text-xl font-manrope-extrabold text-surface-on">
                Tài khoản của tôi
              </AtelierTypography>
              <TouchableOpacity 
                onPress={onClose} 
                className="w-10 h-10 bg-surface-container-low rounded-full items-center justify-center shadow-sm"
              >
                <X size={20} color="#171c1f" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <View className="gap-y-3">
                {wallets.map((wallet) => {
                  const isActive = activeId === wallet.id;
                  const Icon = getWalletIcon(wallet.type);
                  
                  return (
                    <MotiView
                      key={wallet.id}
                      animate={{
                        backgroundColor: isActive ? '#f0f4ff' : '#ffffff',
                        borderColor: isActive ? '#005ab4' : 'rgba(0,0,0,0.05)'
                      }}
                      className="p-4 rounded-[24px] border flex-row items-center border-outline/10 shadow-sm"
                    >
                      <TouchableOpacity 
                        className="flex-1 flex-row items-center"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          onSelect(wallet.id);
                          onClose();
                        }}
                      >
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isActive ? 'bg-primary' : 'bg-surface-container-low'}`}>
                          <Icon size={20} color={isActive ? '#ffffff' : '#434654'} />
                        </View>
                        <View className="flex-1">
                          <AtelierTypography variant="h3" className="text-[15px] font-manrope-bold text-on-surface">
                            {wallet.name}
                          </AtelierTypography>
                          <AtelierTypography variant="caption" className="text-[11px] text-on-surface-variant">
                            {wallet.type === 'BANK' ? `${wallet.bankName} • ****${wallet.accountNumber?.slice(-4)}` : wallet.type}
                          </AtelierTypography>
                          <AtelierTypography variant="label" className="text-primary font-manrope-bold text-[13px] mt-1">
                            {new Intl.NumberFormat('vi-VN').format(wallet.balance)} đ
                          </AtelierTypography>
                        </View>
                        {isActive && (
                          <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center mr-2">
                             <Check size={14} color="#005ab4" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          onEdit(wallet);
                        }}
                        className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low"
                      >
                        <Edit2 size={16} color="#737685" />
                      </TouchableOpacity>
                    </MotiView>
                  );
                })}

                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onAdd();
                  }}
                  className="flex-row items-center justify-center p-5 border-2 border-dashed border-primary/20 rounded-[24px] mt-2"
                >
                  <Plus size={20} color="#005ab4" className="mr-2" />
                  <AtelierTypography variant="label" className="text-primary font-manrope-bold uppercase tracking-widest text-[11px]">
                    Thêm tài khoản mới
                  </AtelierTypography>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
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
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
  },
  sheet: {
    backgroundColor: '#f6fafe',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: SCREEN_HEIGHT * 0.5,
    shadowColor: '#171c1f',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  }
});
