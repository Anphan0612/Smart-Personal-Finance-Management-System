import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {ThemedText} from '../themed-text';
import {ThemedView} from '../themed-view';
import {IconSymbol} from '../ui/icon-symbol';
import {ParsedTransaction} from './NaturalLanguageInput';
import {TransactionParser} from './TransactionParser';

interface ParsedResultEditorProps {
  transaction: ParsedTransaction;
  originalText: string;
  onSave: (transaction: ParsedTransaction) => void;
  onCancel: () => void;
}

export const ParsedResultEditor: React.FC<ParsedResultEditorProps> = ({
  transaction,
  originalText,
  onSave,
  onCancel,
}) => {
  const [editedTransaction, setEditedTransaction] = useState<ParsedTransaction>(transaction);

  useEffect(() => {
    setEditedTransaction(transaction);
  }, [transaction]);

  const updateField = (field: keyof ParsedTransaction, value: any) => {
    setEditedTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validation
    if (!editedTransaction.amount || editedTransaction.amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!editedTransaction.description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả giao dịch');
      return;
    }

    onSave(editedTransaction);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categories = [
    { key: 'food', label: 'Ăn uống', icon: 'fork.knife' },
    { key: 'transport', label: 'Di chuyển', icon: 'car' },
    { key: 'shopping', label: 'Mua sắm', icon: 'bag' },
    { key: 'entertainment', label: 'Giải trí', icon: 'gamecontroller' },
    { key: 'bills', label: 'Hóa đơn', icon: 'doc.text' },
    { key: 'salary', label: 'Lương', icon: 'banknote' },
    { key: 'other', label: 'Khác', icon: 'questionmark.circle' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Chỉnh sửa giao dịch</ThemedText>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Original Text */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Văn bản gốc</ThemedText>
          <View style={styles.originalTextContainer}>
            <ThemedText style={styles.originalText}>{originalText}</ThemedText>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Số tiền</ThemedText>
          <TextInput
            style={styles.amountInput}
            value={editedTransaction.amount.toString()}
            onChangeText={(text) => {
              const numValue = parseInt(text.replace(/[^0-9]/g, '')) || 0;
              updateField('amount', numValue);
            }}
            keyboardType="numeric"
            textContentType="none"
            returnKeyType="done"
            placeholder="Nhập số tiền"
          />
          <ThemedText style={styles.amountDisplay}>
            {formatAmount(editedTransaction.amount)}
          </ThemedText>
        </View>

        {/* Type */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Loại giao dịch</ThemedText>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                editedTransaction.type === 'expense' && styles.typeButtonActive
              ]}
              onPress={() => updateField('type', 'expense')}
            >
              <IconSymbol name="arrow.down.circle" size={20} color={editedTransaction.type === 'expense' ? '#ffffff' : '#ef4444'} />
              <ThemedText style={[
                styles.typeButtonText,
                editedTransaction.type === 'expense' && styles.typeButtonTextActive
              ]}>
                Chi tiêu
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                editedTransaction.type === 'income' && styles.typeButtonActive
              ]}
              onPress={() => updateField('type', 'income')}
            >
              <IconSymbol name="arrow.up.circle" size={20} color={editedTransaction.type === 'income' ? '#ffffff' : '#10b981'} />
              <ThemedText style={[
                styles.typeButtonText,
                editedTransaction.type === 'income' && styles.typeButtonTextActive
              ]}>
                Thu nhập
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Danh mục</ThemedText>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryButton,
                  editedTransaction.category === cat.key && styles.categoryButtonActive
                ]}
                onPress={() => updateField('category', cat.key)}
              >
                <IconSymbol
                  name={cat.icon as any}
                  size={20}
                  color={editedTransaction.category === cat.key ? '#ffffff' : '#6b7280'}
                />
                <ThemedText style={[
                  styles.categoryButtonText,
                  editedTransaction.category === cat.key && styles.categoryButtonTextActive
                ]}>
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mô tả</ThemedText>
          <TextInput
            style={styles.descriptionInput}
            value={editedTransaction.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Nhập mô tả giao dịch"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ngày</ThemedText>
          <TextInput
            style={styles.dateInput}
            value={TransactionParser.formatDate(editedTransaction.date)}
            onChangeText={(text) => {
              // Simple date parsing - in real app, use a date picker
              const parsedDate = new Date(text);
              if (!isNaN(parsedDate.getTime())) {
                updateField('date', parsedDate.toISOString().split('T')[0]);
              }
            }}
            placeholder="DD/MM/YYYY"
          />
        </View>

        {/* Confidence Indicator */}
        <View style={styles.confidenceSection}>
          <ThemedText style={styles.confidenceText}>
            Độ tin cậy: {Math.round(editedTransaction.confidence * 100)}%
          </ThemedText>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${editedTransaction.confidence * 100}%` }
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <IconSymbol name="checkmark" size={20} color="#ffffff" />
          <ThemedText style={styles.saveButtonText}>Lưu</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  originalTextContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  originalText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  amountDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    gap: 6,
    minWidth: '48%',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  confidenceSection: {
    marginBottom: 20,
  },
  confidenceText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  confidenceFill: {
    height: 4,
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  button: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 110,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});