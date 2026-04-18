import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { MotiView } from "moti";
import { 
  X, 
  Store, 
  Calendar as CalendarIcon, 
  Tag, 
  Wallet as WalletIcon, 
  Edit2 
} from "lucide-react-native";
import { AtelierTypography } from "./AtelierTypography";
import { AtelierButton } from "./AtelierButton";
import { formatLiveCurrency, parseCurrency } from "../../utils/format";
import { useWallets } from "../../hooks/useWallets";
import { useAppStore } from "../../store/useAppStore";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface InitialTransactionData {
  amount: number;
  category: string;
  categoryId?: string | null;
  note: string;
  date: string;
  type: string;
}

interface CompactReviewSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: InitialTransactionData | null;
}

export const CompactReviewSheet = ({
  isVisible,
  onClose,
  onSave,
  initialData,
}: CompactReviewSheetProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const { data: wallets = [] } = useWallets();
  const { categories } = useAppStore();

  useEffect(() => {
    if (isVisible && initialData) {
      setAmount(formatLiveCurrency(initialData.amount.toString()));
      setNote(initialData.note || "");
      setSelectedCategoryId(initialData.categoryId || null);
      
      // Default to first wallet if none selected
      if (wallets.length > 0 && !selectedWalletId) {
        setSelectedWalletId(wallets[0].id);
      }
    }
  }, [isVisible, initialData, wallets]);

  if (!isVisible) return null;

  const handleSave = () => {
    if (!initialData) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      amount: parseCurrency(amount),
      note,
      walletId: selectedWalletId,
      categoryId: selectedCategoryId,
      type: initialData.type,
      transactionDate: new Date().toISOString(),
    });
    onClose();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const isSkeleton = !initialData;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0 bg-black/40"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <MotiView
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingBottom: Platform.OS === "ios" ? 40 : 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-2">
              <AtelierTypography variant="label" className="text-outline">
                Review Transaction
              </AtelierTypography>
              <TouchableOpacity
                onPress={handleCancel}
                className="w-8 h-8 rounded-full bg-surface-container/50 items-center justify-center"
              >
                <X size={18} color="#717785" />
              </TouchableOpacity>
            </View>

            {/* Amount Section */}
            <View className="items-center py-6">
              {isSkeleton ? (
                <View className="h-12 w-40 bg-surface-container/30 rounded-xl items-center justify-center">
                  <ActivityIndicator size="small" color="#005ab4" />
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={amount}
                    onChangeText={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAmount(formatLiveCurrency(val));
                    }}
                    keyboardType="numeric"
                    className="text-4xl font-manrope font-extrabold text-primary text-center"
                    style={{ minWidth: 100 }}
                    placeholder="0"
                  />
                  <AtelierTypography variant="h1" className="text-primary opacity-50">
                    ₫
                  </AtelierTypography>
                </View>
              )}
              <AtelierTypography variant="caption" className="mt-1 opacity-60">
                {isSkeleton ? "Đang nạp dữ liệu..." : "Tap to edit amount"}
              </AtelierTypography>
            </View>

            {/* Grid 2x2 */}
            <View className={`px-6 py-4 ${isSkeleton ? "opacity-30" : ""}`}>
              <View className="flex-row gap-4 mb-4">
                {/* Store Name */}
                <View className="flex-1 p-4 bg-surface-container/30 rounded-2xl border border-surface-container/50">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Store size={14} color="#717785" />
                    <AtelierTypography variant="label" className="text-[9px] text-outline">
                      Cửa hàng
                    </AtelierTypography>
                  </View>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    editable={!isSkeleton}
                    className="font-inter font-bold text-[13px] text-surface-on p-0"
                    placeholder="..."
                  />
                </View>

                {/* Date */}
                <View className="flex-1 p-4 bg-surface-container/30 rounded-2xl border border-surface-container/50 opacity-80">
                  <View className="flex-row items-center gap-2 mb-1">
                    <CalendarIcon size={14} color="#717785" />
                    <AtelierTypography variant="label" className="text-[9px] text-outline">
                      Ngày
                    </AtelierTypography>
                  </View>
                  <AtelierTypography variant="body" className="font-bold text-[13px] text-surface-on">
                    {initialData?.date || "..."}
                  </AtelierTypography>
                </View>
              </View>

              <View className="flex-row gap-4">
                {/* Category Picker */}
                <TouchableOpacity 
                  activeOpacity={0.7}
                  disabled={isSkeleton}
                  className="flex-1 p-4 bg-surface-container/30 rounded-2xl border border-surface-container/50"
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View className="flex-row items-center gap-2 mb-1">
                    <Tag size={14} color="#717785" />
                    <AtelierTypography variant="label" className="text-[9px] text-outline">
                      Danh mục
                    </AtelierTypography>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <AtelierTypography variant="body" className="font-bold text-[13px] text-primary">
                      {selectedCategory?.name || initialData?.category || "..."}
                    </AtelierTypography>
                    <Edit2 size={10} color="#005ab4" />
                  </View>
                </TouchableOpacity>

                {/* Wallet Picker */}
                <TouchableOpacity 
                  activeOpacity={0.7}
                  disabled={isSkeleton}
                  className="flex-1 p-4 bg-surface-container/30 rounded-2xl border border-surface-container/50"
                >
                  <View className="flex-row items-center gap-2 mb-1">
                    <WalletIcon size={14} color="#717785" />
                    <AtelierTypography variant="label" className="text-[9px] text-outline">
                      Tài khoản
                    </AtelierTypography>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <AtelierTypography variant="body" className="font-bold text-[13px] text-surface-on">
                      {selectedWallet?.name || "..."}
                    </AtelierTypography>
                    <Edit2 size={10} color="#717785" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View className="px-6 mt-6">
              <AtelierButton
                label="Xác nhận & Lưu"
                onPress={handleSave}
                fullWidth
                size="lg"
                disabled={isSkeleton}
                className="shadow-xl shadow-primary/30"
              />
              <TouchableOpacity
                onPress={handleCancel}
                className="mt-4 items-center"
              >
                <AtelierTypography variant="label" className="text-outline lowercase">
                  Hủy bỏ
                </AtelierTypography>
              </TouchableOpacity>
            </View>
          </MotiView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
