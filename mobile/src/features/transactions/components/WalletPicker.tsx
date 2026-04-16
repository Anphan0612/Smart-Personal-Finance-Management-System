import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  LineChart,
  ChevronRight
} from 'lucide-react-native';
import { AtelierTypography } from '@/components/ui/AtelierTypography';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { WalletResponse } from '@/types/api';

interface WalletPickerProps {
  label: string;
  selectedId: string | null;
  wallets: WalletResponse[];
  onSelect: (wallet: WalletResponse) => void;
  excludeId?: string;
  placeholder?: string;
}

export const WalletPicker = ({ 
  label, 
  selectedId, 
  wallets, 
  onSelect, 
  excludeId,
  placeholder = "Chọn tài khoản/ví"
}: WalletPickerProps) => {
  const filteredWallets = wallets.filter(w => w.id !== excludeId);
  const selectedWallet = wallets.find(w => w.id === selectedId);

  const handleSelect = (wallet: WalletResponse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(wallet);
  };

  const getWalletIcon = (type: string) => {
     switch (type) {
       case 'BANK': return CreditCard;
       case 'CASH': return Banknote;
       case 'EWALLET': return Smartphone;
       case 'INVESTMENT': return LineChart;
       default: return Banknote;
     }
  };

  const Icon = selectedWallet ? getWalletIcon(selectedWallet.type) : Banknote;

  return (
    <View className="gap-4">
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center p-4 bg-surface-container-low rounded-[24px]"
      >
        <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-4">
           <Icon size={18} color="#FFF" />
        </View>
        <View className="flex-1">
          <AtelierTypography variant="h3" className="text-sm font-manrope-bold text-on-surface">
             {selectedWallet ? selectedWallet.name : placeholder}
          </AtelierTypography>
          <AtelierTypography variant="caption" className="text-[10px] text-on-surface-variant font-medium">
             {selectedWallet ? `Balance: ${new Intl.NumberFormat('vi-VN').format(selectedWallet.balance)} đ` : 'Tap to select account'}
          </AtelierTypography>
        </View>
        <ChevronRight size={18} color="#737685" />
      </TouchableOpacity>
      
      {/* Quick Selection List (Keeping it functional but subtle) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
      >
        {filteredWallets.map((wallet) => {
          const isSelected = selectedId === wallet.id;
          const WalletIcon = getWalletIcon(wallet.type);
          
          return (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => handleSelect(wallet)}
              activeOpacity={0.7}
            >
              <MotiView
                animate={{
                  backgroundColor: isSelected ? '#003D9B' : '#FFFFFF',
                  scale: isSelected ? 1 : 0.95
                }}
                className={`flex-row items-center px-4 py-2 rounded-xl ${!isSelected && 'border border-surface-container'}`}
                style={{
                  shadowColor: '#171c1f',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isSelected ? 0.1 : 0.02,
                  shadowRadius: 4,
                  elevation: isSelected ? 2 : 0,
                }}
              >
                <WalletIcon size={14} color={isSelected ? '#FFF' : '#434654'} className="mr-2" />
                <AtelierTypography 
                  variant="label" 
                  className={`text-[10px] lowercase tracking-normal ${isSelected ? 'text-white' : 'text-on-surface-variant'}`}
                >
                  {wallet.name}
                </AtelierTypography>
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
