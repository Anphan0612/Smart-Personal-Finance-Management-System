import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import {
  X,
  Store,
  Calendar as CalendarIcon,
  Tag,
  Wallet as WalletIcon,
  Edit2,
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

import { AtelierTypography } from './AtelierTypography';
import { AtelierButton } from './AtelierButton';
import { formatLiveCurrency, parseCurrency } from '../../utils/format';
import { useWallets } from '../../hooks/useWallets';
import { useAppStore } from '../../store/useAppStore';
import { useUpdateTransaction } from '../../hooks/useTransactions';
import { AtelierTokens } from '../../constants/AtelierTokens';
import { TransactionType } from '../../types/api';

export interface TransactionEditData {
  id?: string;
  amount: number;
  category: string;
  categoryId?: string | null;
  note: string;
  date: string;
  type: string;
  walletId?: string;
}

interface EditTransactionSheetProps {
  onSave?: (data: any) => Promise<void> | void;
  onClose?: () => void;
}

export interface EditTransactionSheetRef {
  open: (data: TransactionEditData) => void;
  dismiss: () => void;
  present: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: string | number) => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  forceClose: () => void;
}

export const EditTransactionSheet = React.forwardRef<
  EditTransactionSheetRef,
  EditTransactionSheetProps
>(({ onSave, onClose }, ref) => {
  // Refs
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // States
  const [editData, setEditData] = useState<TransactionEditData | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activePicker, setActivePicker] = useState<'none' | 'category' | 'wallet' | 'date'>('none');
  const [isSaving, setIsSaving] = useState(false);

  // Data
  const { data: wallets = [] } = useWallets();
  const { categories } = useAppStore();
  const updateMutation = useUpdateTransaction();

  // Snap points
  const snapPoints = useMemo(() => ['85%'], []);

  // Methods
  const open = useCallback(
    (data: TransactionEditData) => {
      setEditData(data);
      setAmount(formatLiveCurrency(data.amount.toString()));
      setNote(data.note || '');
      setSelectedCategoryId(data.categoryId || null);
      setSelectedDate(data.date ? new Date(data.date) : new Date());
      setSelectedWalletId(
        data.walletId ||
          useAppStore.getState().activeWalletId ||
          (wallets.length > 0 ? wallets[0].id : null),
      );
      setActivePicker('none');
      bottomSheetModalRef.current?.present();
    },
    [wallets],
  );

  useImperativeHandle(ref, () => ({
    open,
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
    present: () => bottomSheetModalRef.current?.present(),
    snapToIndex: (index: number) => bottomSheetModalRef.current?.snapToIndex(index),
    snapToPosition: (position: string | number) =>
      bottomSheetModalRef.current?.snapToPosition(position),
    expand: () => bottomSheetModalRef.current?.expand(),
    collapse: () => bottomSheetModalRef.current?.collapse(),
    close: () => bottomSheetModalRef.current?.close(),
    forceClose: () => bottomSheetModalRef.current?.forceClose(),
  }));

  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val);
  };

  useEffect(() => {
    if (editData && !selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(useAppStore.getState().activeWalletId || wallets[0].id);
    }
  }, [editData, selectedWalletId, wallets]);

  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);

    try {
      const finalData = {
        amount: parseCurrency(amount),
        description: note,
        walletId: selectedWalletId || undefined,
        categoryId: selectedCategoryId || undefined,
        type: editData.type as TransactionType,
        transactionDate: selectedDate.toISOString(),
        originalMessageId: (editData as any).originalMessageId,
      };

      if (editData.id) {
        // Luồng Update (PUT)
        await updateMutation.mutateAsync({
          id: editData.id,
          request: finalData,
        });
      } else if (onSave) {
        // Luồng Create (POST - AI Flow)
        await onSave(finalData);
      } else {
        throw new Error('Thiếu handler onSave cho luồng tạo giao dịch.');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetModalRef.current?.dismiss();
      onClose?.();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const apiError = error.response?.data;
      Alert.alert(
        'Lỗi lưu giao dịch',
        apiError?.message || error.message || 'Có lỗi xảy ra khi lưu giao dịch. Vui lòng thử lại.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsAt={-1} appearsAt={0} opacity={0.4} />
    ),
    [],
  );

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  const parsedAmount = parseCurrency(amount);
  const isFormValid =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && !!selectedWalletId && !!selectedCategoryId;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#717785', width: 40 }}
      backgroundStyle={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 32,
      }}
      enablePanDownToClose
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      onDismiss={onClose}
    >
      <BottomSheetView className="flex-1 px-6">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <AtelierTypography variant="h3" className="text-surface-on">
              {editData?.id ? 'Sửa giao dịch' : 'Xác nhận giao dịch AI'}
            </AtelierTypography>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              className="w-10 h-10 rounded-full bg-surface-container/50 items-center justify-center"
            >
              <X size={20} color="#717785" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            {/* Massive Amount Display */}
            <View className="items-center py-8">
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={amount}
                  onChangeText={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleFieldChange(setAmount, formatLiveCurrency(val));
                  }}
                  keyboardType="numeric"
                  className="text-5xl font-manrope font-extrabold text-primary text-center"
                  style={{ minWidth: 150 }}
                />
                <AtelierTypography variant="h1" className="text-primary opacity-50">
                  ₫
                </AtelierTypography>
              </View>
              <AtelierTypography
                variant="caption"
                className={`mt-2 ${parsedAmount === 0 ? 'text-error font-bold' : 'text-outline'}`}
              >
                {parsedAmount === 0 ? 'Số tiền phải lớn hơn 0' : 'Nhấn để chỉnh sửa số tiền'}
              </AtelierTypography>
            </View>

            {/* Grid 2x2 Details */}
            <AnimatePresence exitBeforeEnter>
              {activePicker === 'none' ? (
                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="flex-row flex-wrap gap-4"
                >
                  {/* Store/Note */}
                  <View className="w-[47%] p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Store size={14} color="#717785" />
                      <AtelierTypography variant="label" className="text-[10px] text-outline">
                        Cửa hàng
                      </AtelierTypography>
                    </View>
                    <TextInput
                      value={note}
                      onChangeText={(val) => handleFieldChange(setNote, val)}
                      className="font-inter font-bold text-[14px] text-surface-on p-0"
                      placeholder="..."
                    />
                  </View>

                  {/* Date Picker Trigger */}
                  <TouchableOpacity
                    onPress={() => setActivePicker('date')}
                    className="w-[47%] p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10"
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <CalendarIcon size={14} color="#717785" />
                      <AtelierTypography variant="label" className="text-[10px] text-outline">
                        Ngày
                      </AtelierTypography>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <AtelierTypography variant="body" className="font-bold text-[14px]">
                        {selectedDate.toLocaleDateString('vi-VN')}
                      </AtelierTypography>
                      <Edit2 size={12} color="#717785" />
                    </View>
                  </TouchableOpacity>

                  {/* Category Picker Trigger */}
                  <TouchableOpacity
                    onPress={() => setActivePicker('category')}
                    className={`w-[47%] p-4 bg-surface-container-low/50 rounded-2xl border ${!selectedCategoryId ? 'border-error/30' : 'border-outline-variant/10'}`}
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <Tag
                        size={14}
                        color={!selectedCategoryId ? AtelierTokens.colors.error : '#717785'}
                      />
                      <AtelierTypography
                        variant="label"
                        className={`text-[10px] ${!selectedCategoryId ? 'text-error' : 'text-outline'}`}
                      >
                        Danh mục
                      </AtelierTypography>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <AtelierTypography
                        variant="body"
                        className={`font-bold text-[14px] ${!selectedCategoryId ? 'text-error' : 'text-primary'}`}
                        numberOfLines={1}
                      >
                        {selectedCategory?.name || 'Chọn...'}
                      </AtelierTypography>
                      <Edit2
                        size={12}
                        color={!selectedCategoryId ? AtelierTokens.colors.error : '#005ab4'}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Wallet Picker Trigger */}
                  <TouchableOpacity
                    onPress={() => setActivePicker('wallet')}
                    className={`w-[47%] p-4 bg-surface-container-low/50 rounded-2xl border ${!selectedWalletId ? 'border-error/30' : 'border-outline-variant/10'}`}
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <WalletIcon
                        size={14}
                        color={!selectedWalletId ? AtelierTokens.colors.error : '#717785'}
                      />
                      <AtelierTypography
                        variant="label"
                        className={`text-[10px] ${!selectedWalletId ? 'text-error' : 'text-outline'}`}
                      >
                        Tài khoản
                      </AtelierTypography>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <AtelierTypography
                        variant="body"
                        className={`font-bold text-[14px] ${!selectedWalletId ? 'text-error' : 'text-surface-on'}`}
                        numberOfLines={1}
                      >
                        {selectedWallet?.name || 'Chọn...'}
                      </AtelierTypography>
                      <Edit2
                        size={12}
                        color={!selectedWalletId ? AtelierTokens.colors.error : '#717785'}
                      />
                    </View>
                  </TouchableOpacity>
                </MotiView>
              ) : (
                <MotiView
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  className="bg-surface-container-low/30 rounded-3xl p-4"
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <AtelierTypography variant="label" className="text-primary uppercase font-bold">
                      {activePicker === 'category'
                        ? 'Chọn danh mục'
                        : activePicker === 'wallet'
                          ? 'Chọn tài khoản'
                          : 'Chọn ngày'}
                    </AtelierTypography>
                    <TouchableOpacity onPress={() => setActivePicker('none')}>
                      <AtelierTypography variant="label" className="text-outline">
                        Quay lại
                      </AtelierTypography>
                    </TouchableOpacity>
                  </View>

                  {activePicker === 'date' ? (
                    <View>
                      <View className="flex-row justify-center gap-3 mb-6">
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedDate(new Date());
                            setActivePicker('none');
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }}
                          className="px-6 py-3 bg-ai-primary/10 rounded-full border border-ai-primary/20"
                        >
                          <AtelierTypography variant="label" className="text-ai-primary font-bold">
                            Hôm nay
                          </AtelierTypography>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            setSelectedDate(yesterday);
                            setActivePicker('none');
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }}
                          className="px-6 py-3 bg-surface-container-high rounded-full border border-outline-variant/10"
                        >
                          <AtelierTypography variant="label" className="text-surface-on font-bold">
                            Hôm qua
                          </AtelierTypography>
                        </TouchableOpacity>
                      </View>

                      <View className="items-center bg-white rounded-2xl p-2 border border-outline-variant/10">
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(e, date) => {
                            if (date) setSelectedDate(date);
                            if (Platform.OS === 'android' && (e.type === 'set' || e.type === 'dismissed')) {
                              setActivePicker('none');
                            }
                          }}
                          style={{ height: 120, width: '100%' }}
                        />
                      </View>
                      
                      {Platform.OS === 'ios' && (
                        <TouchableOpacity 
                          onPress={() => setActivePicker('none')}
                          className="mt-4 bg-primary py-3 rounded-xl items-center"
                        >
                          <AtelierTypography variant="label" className="text-white font-bold">Xác nhận ngày</AtelierTypography>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {(activePicker === 'category' ? categories : wallets).map((item: any) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => {
                            if (activePicker === 'category') setSelectedCategoryId(item.id);
                            else setSelectedWalletId(item.id);
                            setActivePicker('none');
                          }}
                          className={`px-4 py-3 rounded-xl border ${
                            (activePicker === 'category'
                              ? selectedCategoryId
                              : selectedWalletId) === item.id
                              ? 'bg-primary border-primary'
                              : 'bg-white border-outline-variant/10'
                          }`}
                          style={{ width: '48%' }}
                        >
                          <AtelierTypography
                            variant="label"
                            className={
                              (activePicker === 'category'
                                ? selectedCategoryId
                                : selectedWalletId) === item.id
                                ? 'text-white'
                                : 'text-surface-on'
                            }
                          >
                            {item.name}
                          </AtelierTypography>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </MotiView>
              )}
            </AnimatePresence>

            {/* Save Button */}
            <View className="mt-12 mb-8">
              <AtelierButton
                label={isSaving ? 'Đang lưu...' : 'Xác nhận & Lưu'}
                onPress={handleSave}
                variant="gradient"
                fullWidth
                size="lg"
                disabled={isSaving || !isFormValid}
              />
              <TouchableOpacity
                onPress={() => bottomSheetModalRef.current?.dismiss()}
                className="mt-4 items-center"
              >
                <AtelierTypography variant="label" className="text-outline">
                  Hủy bỏ
                </AtelierTypography>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
