import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  FileText,
  DollarSign,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
  Save,
  RotateCcw,
} from 'lucide-react-native';
import { TransactionResponse } from '@/types/api';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { format, parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { ImageViewer } from './ImageViewer';
import { DYNAMIC_BASE_URL } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateTransaction } from '@/hooks/useTransactions';

interface Props {
  transaction: TransactionResponse | null;
  isVisible: boolean;
  onClose: () => void;
  initialEditMode?: boolean;
  onDelete?: (transaction: TransactionResponse) => void;
}

export default function TransactionDetailSheet({ 
  transaction, 
  isVisible, 
  onClose,
  initialEditMode = false,
  onDelete
}: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '90%'], []);
  const { token } = useAppStore();
  const { data: categories } = useCategories();
  const updateMutation = useUpdateTransaction();

  const [isEditing, setIsEditing] = useState(false);
  const [showImageFull, setShowImageFull] = useState(false);

  // Edit state (Cloned data)
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    type: 'EXPENSE' as 'EXPENSE' | 'INCOME',
  });

  useEffect(() => {
    if (transaction) {
      setEditForm({
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        categoryId: transaction.categoryId,
        type: transaction.type as 'EXPENSE' | 'INCOME',
      });
      setIsEditing(initialEditMode);
    }
  }, [transaction, initialEditMode]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(initialEditMode ? 1 : 0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, initialEditMode]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsAt={-1} appearsAt={0} opacity={0.5} />
    ),
    [],
  );

  const fullImageUrl = useMemo(() => {
    if (!transaction?.receiptImageUrl) return null;
    const baseUrl = DYNAMIC_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${transaction.receiptImageUrl}`;
  }, [transaction?.receiptImageUrl]);

  const handleSave = async () => {
    if (!transaction) return;
    if (!editForm.categoryId) {
      alert('Vui lòng chọn hạng mục');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        request: {
          amount: parseFloat(editForm.amount),
          description: editForm.description,
          categoryId: editForm.categoryId,
          type: editForm.type,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel logic
      setEditForm({
        amount: transaction?.amount.toString() || '',
        description: transaction?.description || '',
        categoryId: transaction?.categoryId || '',
        type: transaction?.type as 'EXPENSE' | 'INCOME' || 'EXPENSE',
      });
    }
    setIsEditing(!isEditing);
  };

  if (!transaction) return null;

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={handleSheetChange}
        handleIndicatorStyle={{ backgroundColor: '#717785' }}
        keyboardBehavior="extend"
        backgroundStyle={{ backgroundColor: editForm.type === 'INCOME' ? '#f0fff4' : '#fff5f5' }}
      >
        {/* Fixed Header */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 8 }}>
          <View className="flex-row items-center justify-between mt-2 mb-4">
            <Text className={`font-headline font-extrabold text-xl ${editForm.type === 'INCOME' ? 'text-green-800' : 'text-on-surface'}`}>
              {isEditing ? 'Chỉnh sửa.' : 'Chi tiết.'}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={toggleEdit}
                className={`w-10 h-10 rounded-full items-center justify-center ${isEditing ? 'bg-surface-container' : 'bg-primary/10'}`}
              >
                {isEditing ? (
                  <RotateCcw size={18} color="#717785" />
                ) : (
                  <Edit3 size={18} color="#005ab4" />
                )}
              </TouchableOpacity>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => {
                    if (transaction && onDelete) {
                      onDelete(transaction);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-error/10 items-center justify-center"
                >
                  <Trash2 size={18} color="#ba1a1a" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => bottomSheetRef.current?.close()}
                className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
              >
                <X size={18} color="#181c22" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <BottomSheetScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        >
            {/* Amount & Main Info Section */}
            <View className="bg-white rounded-[24px] p-6 mb-6 shadow-sm border border-outline/5">
              <View className="items-center mb-6">
                <View
                  className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${
                    editForm.type === 'INCOME' ? 'bg-secondary/10' : 'bg-error/10'
                  }`}
                >
                  <DollarSign
                    size={24}
                    color={editForm.type === 'INCOME' ? '#00C853' : '#FF5252'}
                  />
                </View>

                {isEditing && (
                  <View className="flex-row bg-surface-container p-1 rounded-full mb-6 w-full max-w-[240px]">
                    <TouchableOpacity
                      onPress={() => {
                        const isChanging = editForm.type !== 'EXPENSE';
                        setEditForm({ 
                          ...editForm, 
                          type: 'EXPENSE',
                          categoryId: isChanging ? '' : editForm.categoryId 
                        });
                      }}
                      className={`flex-1 py-2 px-4 rounded-full items-center justify-center ${editForm.type === 'EXPENSE' ? 'bg-[#FF4B4B]' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${editForm.type === 'EXPENSE' ? 'text-white' : 'text-neutral-500'}`}>
                        Chi tiêu
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const isChanging = editForm.type !== 'INCOME';
                        setEditForm({ 
                          ...editForm, 
                          type: 'INCOME',
                          categoryId: isChanging ? '' : editForm.categoryId 
                        });
                      }}
                      className={`flex-1 py-2 px-4 rounded-full items-center justify-center ${editForm.type === 'INCOME' ? 'bg-green-600' : ''}`}
                    >
                      <Text className={`text-xs font-bold ${editForm.type === 'INCOME' ? 'text-white' : 'text-neutral-500'}`}>
                        Thu nhập
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isEditing ? (
                  <View className="w-full flex-row items-center justify-center border-b border-outline/20 pb-2">
                    <Text className={`font-headline font-bold text-2xl mr-1 ${editForm.type === 'INCOME' ? 'text-green-600' : 'text-error'}`}>
                      {editForm.type === 'INCOME' ? '+' : '-'}
                    </Text>
                    <BottomSheetTextInput
                      className="font-headline font-bold text-3xl text-on-surface text-center"
                      value={editForm.amount}
                      onChangeText={(text) => setEditForm({ ...editForm, amount: text })}
                      keyboardType="numeric"
                      placeholder="0.00"
                    />
                  </View>
                ) : (
                  <Text
                    className={`font-headline font-bold text-3xl ${
                      transaction.type === 'INCOME' ? 'text-secondary' : 'text-error'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                )}

                <Text className="text-outline font-bold text-[10px] uppercase tracking-widest mt-2">
                  {formatDateTime(transaction.transactionDate)}
                </Text>
              </View>

              <View className="space-y-4">
                {/* Description */}
                <View className="flex-row items-start gap-4">
                  <View className="w-8 h-8 rounded-lg bg-surface items-center justify-center">
                    <FileText size={16} color="#717785" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                      Description
                    </Text>
                    {isEditing ? (
                      <BottomSheetTextInput
                        className="font-medium text-[15px] text-on-surface border-b border-outline/10 py-1"
                        value={editForm.description}
                        onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                        multiline
                      />
                    ) : (
                      <Text className="font-medium text-[15px] text-on-surface">
                        {transaction.description || 'No description'}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Category */}
                <View className="flex-row items-start gap-4">
                  <View className="w-8 h-8 rounded-lg bg-surface items-center justify-center">
                    <Tag size={16} color="#717785" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                      Category
                    </Text>
                    {isEditing ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        disallowInterruption={true}
                        className="mt-2"
                      >
                        <View className="flex-row gap-2">
                          {categories
                            ?.filter((cat) => cat.type === editForm.type)
                            ?.map((cat) => (
                              <TouchableOpacity
                                key={cat.id}
                                onPress={() => setEditForm({ ...editForm, categoryId: cat.id })}
                                className={`px-4 py-2 rounded-full border ${
                                  editForm.categoryId === cat.id
                                    ? 'bg-primary border-primary'
                                    : 'bg-white border-outline/20'
                                }`}
                              >
                                <Text
                                  className={`text-xs font-bold ${
                                    editForm.categoryId === cat.id ? 'text-white' : 'text-on-surface'
                                  }`}
                                >
                                  {cat.name}
                                </Text>
                              </TouchableOpacity>
                            ))}
                        </View>
                      </ScrollView>
                    ) : (
                      <Text className="font-medium text-[15px] text-on-surface">
                        {transaction.categoryName || 'General'}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Receipt Proof Section */}
            <View className="bg-white rounded-[24px] p-6 mb-8 shadow-sm border border-outline/5">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <ImageIcon size={18} color="#717785" />
                  <Text className="font-headline font-bold text-sm text-on-surface">
                    Receipt Evidence
                  </Text>
                </View>
                {fullImageUrl && (
                  <TouchableOpacity
                    onPress={() => setShowImageFull(true)}
                    className="flex-row items-center gap-1"
                  >
                    <Text className="text-[10px] font-bold text-primary tracking-wider uppercase">
                      Full view
                    </Text>
                    <Maximize2 size={12} color="#005ab4" />
                  </TouchableOpacity>
                )}
              </View>

              {fullImageUrl ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowImageFull(true)}
                  className="w-full h-64 rounded-2xl overflow-hidden bg-surface-container"
                >
                  <Image
                    source={{
                      uri: fullImageUrl,
                      headers: { Authorization: `Bearer ${token}` },
                    }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={300}
                  />
                </TouchableOpacity>
              ) : (
                <View className="w-full h-32 rounded-2xl border-2 border-dashed border-outline/20 items-center justify-center bg-surface-container-low">
                  <FileText size={32} color="rgba(113, 119, 133, 0.3)" />
                  <Text className="text-outline/50 font-bold text-[10px] uppercase tracking-widest mt-2">
                    No receipt attached
                  </Text>
                </View>
              )}
            </View>

            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Save size={20} color="#ffffff" className="mr-2" />
                    <Text className="text-white font-bold text-lg">Lưu thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </BottomSheetScrollView>
      </BottomSheet>

      {/* Full Screen Image Viewer */}
      {fullImageUrl && (
      <ImageViewer
          images={[{ uri: fullImageUrl, headers: { Authorization: `Bearer ${token}` } }]}
          visible={showImageFull}
          onRequestClose={() => setShowImageFull(false)}
        />
      )}
    </>
  );
}
