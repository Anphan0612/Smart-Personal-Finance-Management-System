import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
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
  RotateCcw
} from "lucide-react-native";
import { TransactionResponse } from "@/types/api";
import { formatCurrency } from "@/utils/format";
import { format, parseISO } from "date-fns";
import { Image } from "expo-image";
import ImageView from "react-native-image-viewing";
import { DYNAMIC_BASE_URL } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { useCategories } from "@/hooks/useCategories";
import { useUpdateTransaction } from "@/hooks/useTransactions";

interface Props {
  transaction: TransactionResponse | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function TransactionDetailSheet({ transaction, isVisible, onClose }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);
  const { token } = useAppStore();
  const { data: categories } = useCategories();
  const updateMutation = useUpdateTransaction();

  const [isEditing, setIsEditing] = useState(false);
  const [showImageFull, setShowImageFull] = useState(false);
  
  // Edit state (Cloned data)
  const [editForm, setEditForm] = useState({
    amount: "",
    description: "",
    categoryId: ""
  });

  useEffect(() => {
    if (transaction) {
      setEditForm({
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        categoryId: transaction.categoryId
      });
      setIsEditing(false);
    }
  }, [transaction]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsAt={-1} appearsAt={0} opacity={0.5} />
    ),
    []
  );

  const fullImageUrl = useMemo(() => {
    if (!transaction?.receiptImageUrl) return null;
    const baseUrl = DYNAMIC_BASE_URL.replace("/api/v1", "");
    return `${baseUrl}${transaction.receiptImageUrl}`;
  }, [transaction?.receiptImageUrl]);

  const handleSave = async () => {
    if (!transaction) return;
    
    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        request: {
          amount: parseFloat(editForm.amount),
          description: editForm.description,
          categoryId: editForm.categoryId
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel logic
      setEditForm({
        amount: transaction?.amount.toString() || "",
        description: transaction?.description || "",
        categoryId: transaction?.categoryId || ""
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
        backgroundStyle={{ backgroundColor: "#f9f9ff" }}
        handleIndicatorStyle={{ backgroundColor: "#717785" }}
        keyboardBehavior="fillParent"
      >
        <BottomSheetView className="flex-1 px-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-headline font-extrabold text-xl text-on-surface">
              {isEditing ? "Edit activity." : "Receipt check."}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={toggleEdit}
                className={`w-10 h-10 rounded-full items-center justify-center ${isEditing ? 'bg-surface-container' : 'bg-primary/10'}`}
              >
                {isEditing ? <RotateCcw size={18} color="#717785" /> : <Edit3 size={18} color="#005ab4" />}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => bottomSheetRef.current?.close()}
                className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
              >
                <X size={18} color="#181c22" />
              </TouchableOpacity>
            </View>
          </View>

          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            {/* Amount & Main Info Section */}
            <View className="bg-white rounded-[24px] p-6 mb-6 shadow-sm border border-outline/5">
              <View className="items-center mb-6">
                <View className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${
                  transaction.type === 'INCOME' ? 'bg-secondary/10' : 'bg-error/10'
                }`}>
                  <DollarSign size={24} color={transaction.type === 'INCOME' ? "#00C853" : "#FF5252"} />
                </View>
                
                {isEditing ? (
                  <View className="w-full flex-row items-center justify-center border-b border-outline/20 pb-2">
                    <Text className="font-headline font-bold text-2xl text-on-surface mr-1">
                      {transaction.type === 'INCOME' ? '+' : '-'}
                    </Text>
                    <TextInput
                      className="font-headline font-bold text-3xl text-on-surface text-center"
                      value={editForm.amount}
                      onChangeText={(text) => setEditForm({ ...editForm, amount: text })}
                      keyboardType="numeric"
                      placeholder="0.00"
                      autoFocus
                    />
                  </View>
                ) : (
                  <Text className={`font-headline font-bold text-3xl ${
                    transaction.type === 'INCOME' ? 'text-secondary' : 'text-error'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                )}
                
                <Text className="text-outline font-bold text-[10px] uppercase tracking-widest mt-2">
                  {format(parseISO(transaction.transactionDate), "MMMM dd, yyyy • HH:mm")}
                </Text>
              </View>

              <View className="space-y-4">
                {/* Description */}
                <View className="flex-row items-start gap-4">
                  <View className="w-8 h-8 rounded-lg bg-surface items-center justify-center">
                    <FileText size={16} color="#717785" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Description</Text>
                    {isEditing ? (
                      <TextInput
                        className="font-medium text-[15px] text-on-surface border-b border-outline/10 py-1"
                        value={editForm.description}
                        onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                        multiline
                      />
                    ) : (
                      <Text className="font-medium text-[15px] text-on-surface">{transaction.description || "No description"}</Text>
                    )}
                  </View>
                </View>

                {/* Category */}
                <View className="flex-row items-start gap-4">
                  <View className="w-8 h-8 rounded-lg bg-surface items-center justify-center">
                    <Tag size={16} color="#717785" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Category</Text>
                    {isEditing ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                        <View className="flex-row gap-2">
                          {categories?.map((cat) => (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => setEditForm({ ...editForm, categoryId: cat.id })}
                              className={`px-4 py-2 rounded-full border ${
                                editForm.categoryId === cat.id ? 'bg-primary border-primary' : 'bg-white border-outline/20'
                              }`}
                            >
                              <Text className={`text-xs font-bold ${editForm.categoryId === cat.id ? 'text-white' : 'text-on-surface'}`}>
                                {cat.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    ) : (
                      <Text className="font-medium text-[15px] text-on-surface">{transaction.categoryName || 'General'}</Text>
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
                  <Text className="font-headline font-bold text-sm text-on-surface">Receipt Evidence</Text>
                </View>
                {fullImageUrl && (
                  <TouchableOpacity 
                    onPress={() => setShowImageFull(true)}
                    className="flex-row items-center gap-1"
                  >
                    <Text className="text-[10px] font-bold text-primary tracking-wider uppercase">Full view</Text>
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
                      headers: { Authorization: `Bearer ${token}` }
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
                    <Text className="text-white font-bold text-lg">Save changes</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Full Screen Image Viewer */}
      {fullImageUrl && (
        <ImageView
          images={[{ uri: fullImageUrl, headers: { Authorization: `Bearer ${token}` } }]}
          imageIndex={0}
          visible={showImageFull}
          onRequestClose={() => setShowImageFull(false)}
        />
      )}
    </>
  );
}
