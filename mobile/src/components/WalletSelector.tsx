import React from 'react';
import { View, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Wallet as WalletIcon, TrendingUp, Landmark, Banknote } from 'lucide-react-native';
import { AtelierTypography } from './ui';
import { WalletResponse as Wallet } from '../types/api';

interface WalletSelectorProps {
  wallets: Wallet[];
  activeWalletId: string | null;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

const getWalletIcon = (type: Wallet['type'], color: string = '#005ab4') => {
  switch (type) {
    case 'BANK':
      return <Landmark size={20} color={color} />;
    case 'EWALLET':
      return <Landmark size={20} color={color} />; // or credit card
    case 'INVESTMENT':
      return <TrendingUp size={20} color={color} />;
    case 'CASH':
    default:
      return <Banknote size={20} color={color} />;
  }
};

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  wallets,
  activeWalletId,
  onSelect,
  style,
}) => {
  return (
    <View style={style}>
      <AtelierTypography variant="h3" className="mb-4 px-1">
        Your Accounts
      </AtelierTypography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 24 }}
      >
        {wallets.map((wallet, index) => {
          const isActive = wallet.id === activeWalletId;
          return (
            <MotiView
              key={wallet.id}
              from={{ opacity: 0, scale: 0.9, translateX: 20 }}
              animate={{ opacity: 1, scale: 1, translateX: 0 }}
              transition={{ delay: 100 + index * 50 }}
            >
              <TouchableOpacity
                onPress={() => onSelect(wallet.id)}
                className={`w-40 p-4 rounded-3xl border-2 ${
                  isActive
                    ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                    : 'bg-surface-container-lowest border-surface-container shadow-sm'
                }`}
              >
                <View
                  className={`w-8 h-8 rounded-full mb-3 items-center justify-center ${
                    isActive ? 'bg-white/20' : 'bg-primary/10'
                  }`}
                >
                  {getWalletIcon(wallet.type, isActive ? '#ffffff' : '#005ab4')}
                </View>
                <AtelierTypography
                  variant="label"
                  className={`text-[10px] mb-1 ${isActive ? 'text-white/80' : 'text-surface-on-variant'}`}
                >
                  {wallet.name}
                </AtelierTypography>
                <AtelierTypography
                  variant="h3"
                  className={`text-lg ${isActive ? 'text-white' : 'text-surface-on'}`}
                >
                  {new Intl.NumberFormat(wallet.currencyCode === 'VND' ? 'vi-VN' : 'en-US', {
                    style: 'currency',
                    currency: wallet.currencyCode,
                    maximumFractionDigits: wallet.currencyCode === 'VND' ? 0 : 2,
                  }).format(wallet.balance)}
                </AtelierTypography>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>
    </View>
  );
};
