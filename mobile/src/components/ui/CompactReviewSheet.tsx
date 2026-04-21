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
  ScrollView,
  Alert,
} from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { 
  X, 
  Store, 
  Calendar as CalendarIcon, 
  Tag, 
  Wallet as WalletIcon, 
  Edit2,
  ChevronRight,
  Check,
  Coffee,
  Utensils,
  ShoppingBag,
  Home,
  Car,
  Zap,
  Heart,
  Info,
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  PiggyBank
} from "lucide-react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Icon and Color Mappings
  const getCategoryIcon = (iconName?: string | null) => {
    const name = (iconName || "").toLowerCase();
    if (name.includes("coffee")) return Coffee;
    if (name.includes("food") || name.includes("utensils")) return Utensils;
    if (name.includes("shopping")) return ShoppingBag;
    if (name.includes("home")) return Home;
    if (name.includes("car") || name.includes("transport")) return Car;
    if (name.includes("zap") || name.includes("bill")) return Zap;
    if (name.includes("heart") || name.includes("health")) return Heart;
    return Tag;
  };

  const getWalletMetadata = (type: string) => {
    switch (type) {
      case "BANK":
        return { Icon: Landmark, color: "#005ab4", bg: "#e6f0f9" };
      case "CASH":
        return { Icon: Banknote, color: "#2e7d32", bg: "#e8f5e9" };
      case "EWALLET":
        return { Icon: Smartphone, color: "#7b1fa2", bg: "#f3e5f5" };
      case "INVESTMENT":
        return { Icon: PiggyBank, color: "#f57c00", bg: "#fff3e0" };
      default:
        return { Icon: CreditCard, color: "#717785", bg: "#f1f3f5" };
    }
  };

  // UI States
  const [activePicker, setActivePicker] = useState<"none" | "category" | "wallet" | "date">("none");
  const [isDirty, setIsDirty] = useState(false);
  
  const { data: wallets = [] } = useWallets();
  const { categories } = useAppStore();

  useEffect(() => {
    if (isVisible && initialData) {
      setAmount(formatLiveCurrency(initialData.amount.toString()));
      setNote(initialData.note || "");
      setSelectedCategoryId(initialData.categoryId || null);
      setSelectedDate(initialData.date ? new Date(initialData.date) : new Date());
      setIsDirty(false);
      setActivePicker("none");
      
      // Default to active wallet from store if available, or first wallet
      if (wallets.length > 0 && !selectedWalletId) {
        const defaultWalletId = useAppStore.getState().activeWalletId || wallets[0].id;
        setSelectedWalletId(defaultWalletId);
      }
    }
  }, [isVisible, initialData, wallets]);

  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setIsDirty(true);
  };

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
      transactionDate: selectedDate.toISOString(),
    });
    onClose();
  };

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive", 
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            } 
          }
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setActivePicker("none");
    }
    
    if (date) {
      handleFieldChange(setSelectedDate, date);
    }
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
                      handleFieldChange(setAmount, formatLiveCurrency(val));
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

            {/* Editing Section / Grid */}
            <View className="relative px-6 py-4" style={{ minHeight: 220 }}>
              <AnimatePresence exitBeforeEnter>
                {activePicker === "none" ? (
                  <MotiView
                    key="main-grid"
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className={isSkeleton ? "opacity-30" : ""}
                  >
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
                          onChangeText={(val) => handleFieldChange(setNote, val)}
                          editable={!isSkeleton}
                          className="font-inter font-bold text-[13px] text-surface-on p-0"
                          placeholder="..."
                        />
                      </View>

                      {/* Date */}
                      <TouchableOpacity 
                        onPress={() => setActivePicker("date")}
                        disabled={isSkeleton}
                        className="flex-1 p-4 bg-surface-container/30 rounded-2xl border border-surface-container/50"
                      >
                        <View className="flex-row items-center gap-2 mb-1">
                          <CalendarIcon size={14} color="#717785" />
                          <AtelierTypography variant="label" className="text-[9px] text-outline">
                            Ngày
                          </AtelierTypography>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <AtelierTypography variant="body" className="font-bold text-[13px] text-surface-on">
                            {selectedDate.toLocaleDateString('vi-VN')}
                          </AtelierTypography>
                          <Edit2 size={10} color="#717785" />
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-4">
                      {/* Category Picker */}
                      <TouchableOpacity 
                        activeOpacity={0.7}
                        disabled={isSkeleton}
                        className="flex-1 p-4 bg-surface-container/30 rounded-2xl border border-surface-container/50"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setActivePicker("category");
                        }}
                      >
                        <View className="flex-row items-center gap-2 mb-1">
                          <Tag size={14} color="#717785" />
                          <AtelierTypography variant="label" className="text-[9px] text-outline">
                            Danh mục
                          </AtelierTypography>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <AtelierTypography variant="body" className="font-bold text-[13px] text-primary" numberOfLines={1}>
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
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setActivePicker("wallet");
                        }}
                      >
                        <View className="flex-row items-center gap-2 mb-1">
                          <WalletIcon size={14} color="#717785" />
                          <AtelierTypography variant="label" className="text-[9px] text-outline">
                            Tài khoản
                          </AtelierTypography>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <AtelierTypography variant="body" className="font-bold text-[13px] text-surface-on" numberOfLines={1}>
                            {selectedWallet?.name || "..."}
                          </AtelierTypography>
                          <Edit2 size={10} color="#717785" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                ) : (
                  <MotiView
                    key="selector"
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -20 }}
                    style={{ flex: 1 }}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <AtelierTypography variant="label" className="text-primary">
                        {activePicker === "category" ? "Chọn danh mục" : activePicker === "wallet" ? "Chọn tài khoản" : "Chọn ngày"}
                      </AtelierTypography>
                      <TouchableOpacity 
                        onPress={() => setActivePicker("none")}
                        className="px-3 py-1 bg-surface-container/50 rounded-full"
                      >
                        <AtelierTypography variant="label" className="text-[10px] text-outline">Quay lại</AtelierTypography>
                      </TouchableOpacity>
                    </View>

                    {activePicker === "date" ? (
                      <View className="items-center bg-surface-container/20 rounded-2xl p-4">
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onDateChange}
                          textColor="#001d3d"
                        />
                      </View>
                    ) : (
                      <ScrollView 
                        style={{ maxHeight: 160 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                      >
                        <View className="flex-row flex-wrap gap-2">
                          {(activePicker === "category" ? categories : wallets).map((item: any) => {
                            const isSelected = activePicker === "category" 
                              ? item.id === selectedCategoryId 
                              : item.id === selectedWalletId;
                            
                            const IconComponent = activePicker === "category" 
                              ? getCategoryIcon(item.iconName)
                              : getWalletMetadata(item.type).Icon;
                            
                            const meta = activePicker === "wallet" ? getWalletMetadata(item.type) : null;
                            
                            return (
                              <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  if (activePicker === "category") {
                                    handleFieldChange(setSelectedCategoryId, item.id);
                                  } else {
                                    handleFieldChange(setSelectedWalletId, item.id);
                                  }
                                  setActivePicker("none");
                                }}
                                className={`px-4 py-3 rounded-2xl border ${
                                  isSelected 
                                    ? "bg-primary border-primary" 
                                    : "bg-surface-container/20 border-surface-container/40"
                                }`}
                                style={{ width: '48.5%' }}
                              >
                                <View className="flex-row items-center gap-3">
                                  <View 
                                    className={`w-8 h-8 rounded-lg items-center justify-center ${isSelected ? "bg-white/20" : "bg-white"}`}
                                    style={!isSelected && meta ? { backgroundColor: meta.bg } : {}}
                                  >
                                    <IconComponent 
                                      size={16} 
                                      color={isSelected ? "white" : (meta ? meta.color : "#717785")} 
                                    />
                                  </View>
                                  <View className="flex-1">
                                    <AtelierTypography 
                                      variant="body" 
                                      numberOfLines={1}
                                      className={`font-bold text-[12px] ${isSelected ? "text-white" : "text-surface-on"}`}
                                    >
                                      {item.name}
                                    </AtelierTypography>
                                    {activePicker === "wallet" && !isSelected && (
                                      <AtelierTypography variant="label" className="text-[8px] text-outline uppercase">
                                        {item.type}
                                      </AtelierTypography>
                                    )}
                                  </View>
                                  {isSelected && <Check size={12} color="white" />}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>
                    )}
                  </MotiView>
                )}
              </AnimatePresence>
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
