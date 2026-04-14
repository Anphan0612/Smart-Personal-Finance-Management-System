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

  return (
    <View className="gap-3">
      <AtelierTypography variant="label" className="text-surface-on-variant ml-1">
        {label}
      </AtelierTypography>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
      >
        {filteredWallets.map((wallet) => {
          const isSelected = selectedId === wallet.id;
          const Icon = getWalletIcon(wallet.type);
          
          return (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => handleSelect(wallet)}
              activeOpacity={0.7}
            >
              <MotiView
                animate={{
                  backgroundColor: isSelected ? '#003D9B' : '#FFFFFF',
                  borderColor: isSelected ? '#003D9B' : '#E5E7EB',
                }}
                className="flex-row items-center px-4 py-3 rounded-2xl border min-w-[140px]"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isSelected ? 0.1 : 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View 
                  className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isSelected ? 'bg-white/20' : 'bg-surface-container-low'}`}
                >
                  <Icon size={16} color={isSelected ? '#FFF' : '#374151'} />
                </View>
                <View>
                  <AtelierTypography 
                    variant="h3" 
                    className={`text-sm ${isSelected ? 'text-white' : 'text-surface-on'}`}
                  >
                    {wallet.name}
                  </AtelierTypography>
                  <AtelierTypography 
                    variant="caption" 
                    className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-surface-on-variant'}`}
                  >
                    {new Intl.NumberFormat('vi-VN').format(wallet.balance)} đ
                  </AtelierTypography>
                </View>
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
