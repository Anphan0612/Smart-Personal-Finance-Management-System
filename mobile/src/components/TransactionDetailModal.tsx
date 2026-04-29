import React from 'react';
import { View, Modal, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import {
  X,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { AtelierTypography, AtelierCard, AtelierButton } from './ui';
import { TransactionResponse as Transaction } from '../types/api';

interface TransactionDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const { height } = Dimensions.get('window');

export const TransactionDetailModal = ({
  isVisible,
  onClose,
  transaction,
}: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const isExpense = transaction.type === 'EXPENSE';

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <AnimatePresence>
          {isVisible && (
            <MotiView
              key="transaction-detail-modal-container"
              from={{ translateY: height }}
              animate={{ translateY: 0 }}
              exit={{ translateY: height }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.container}
            >
              <AtelierCard
                elevation="high"
                padding="none"
                className="rounded-t-[40px] overflow-hidden bg-surface"
              >
                {/* Header with Close Button */}
                <View className="p-6 pb-2 flex-row justify-between items-center">
                  <AtelierTypography variant="h3">Transaction Detail</AtelierTypography>
                  <Pressable onPress={onClose} className="p-2 bg-surface-container rounded-full">
                    <X size={20} color="#414753" />
                  </Pressable>
                </View>

                {/* Amount Section */}
                <View className="items-center py-8">
                  <View
                    className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isExpense ? 'bg-error-container' : 'bg-primary-container'}`}
                  >
                    {isExpense ? (
                      <ArrowUpRight size={32} color="#ba1a1a" />
                    ) : (
                      <ArrowDownLeft size={32} color="#005ab4" />
                    )}
                  </View>
                  <AtelierTypography
                    variant="h1"
                    className={`text-4xl ${isExpense ? 'text-error' : 'text-primary'}`}
                  >
                    {isExpense ? '-' : '+'}${transaction.amount.toLocaleString()}
                  </AtelierTypography>
                  <AtelierTypography variant="label" className="text-surface-on-variant mt-1">
                    {transaction.description || 'No description'}
                  </AtelierTypography>
                </View>

                {/* Info List */}
                <View className="px-6 pb-12 gap-6">
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center">
                      <Calendar size={20} color="#414753" />
                    </View>
                    <View>
                      <AtelierTypography
                        variant="label"
                        className="text-[10px] text-surface-on-variant"
                      >
                        Date
                      </AtelierTypography>
                      <AtelierTypography variant="h3" className="text-sm">
                        {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </AtelierTypography>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center">
                      <Tag size={20} color="#414753" />
                    </View>
                    <View>
                      <AtelierTypography
                        variant="label"
                        className="text-[10px] text-surface-on-variant"
                      >
                        Category
                      </AtelierTypography>
                      <AtelierTypography variant="h3" className="text-sm">
                        {transaction.categoryName || 'General'}
                      </AtelierTypography>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center">
                      <CreditCard size={20} color="#414753" />
                    </View>
                    <View>
                      <AtelierTypography
                        variant="label"
                        className="text-[10px] text-surface-on-variant"
                      >
                        Type
                      </AtelierTypography>
                      <AtelierTypography variant="h3" className="text-sm">
                        {transaction.type}
                      </AtelierTypography>
                    </View>
                  </View>

                  {transaction.description && (
                    <View className="flex-row items-start gap-4">
                      <View className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center">
                        <FileText size={20} color="#414753" />
                      </View>
                      <View className="flex-1">
                        <AtelierTypography
                          variant="label"
                          className="text-[10px] text-surface-on-variant"
                        >
                          Notes
                        </AtelierTypography>
                        <AtelierTypography variant="body" className="text-sm leading-5">
                          {transaction.description}
                        </AtelierTypography>
                      </View>
                    </View>
                  )}

                  <AtelierButton
                    label="Edit Transaction"
                    variant="secondary"
                    className="mt-4"
                    onPress={() => {
                      /* Handle Edit */
                    }}
                  />
                </View>
              </AtelierCard>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
  },
});
