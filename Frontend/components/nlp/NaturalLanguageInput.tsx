import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { IconSymbol } from '../ui/icon-symbol';
import { ParsedResultEditor } from './ParsedResultEditor';
import { TransactionParser } from './TransactionParser';

export interface ParsedTransaction {
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  confidence: number; // 0-1, độ tin cậy của parsing
}

interface NaturalLanguageInputProps {
  onSave: (transaction: ParsedTransaction) => void;
  onCancel: () => void;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  onSave,
  onCancel,
}) => {
  const [inputText, setInputText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedTransaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    setError(null);

    if (!inputText.trim()) {
      setError('Vui lòng nhập nội dung giao dịch');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = TransactionParser.parse(inputText);

      if (!result || !result.amount || !result.category) {
        setError('Không thể phân tích nội dung. Vui lòng thử lại.');
        setParsedResult(null);
        setIsLoading(false);
        return;
      }

      setParsedResult(result);
      // If confidence is low, force confirmation. Otherwise, allow auto-save
      if (result.confidence < 0.7) {
        setShowConfirm(true);
      } else {
        // Auto-save for high confidence results
        handleSave(result);
      }
    } catch {
      setError('Có lỗi xảy ra khi phân tích. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (editedTransaction: ParsedTransaction) => {
    onSave(editedTransaction);
    // Reset state
    setInputText('');
    setParsedResult(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setParsedResult(null);
    setIsEditing(false);
  };

  if (showConfirm && parsedResult) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.confirmTitle}>Xác nhận thông tin đã parse</ThemedText>
        <View style={styles.confirmRow}>
          <ThemedText style={styles.confirmLabel}>Mô tả:</ThemedText>
          <ThemedText style={styles.confirmValue}>{parsedResult.description}</ThemedText>
        </View>
        <View style={styles.confirmRow}>
          <ThemedText style={styles.confirmLabel}>Số tiền:</ThemedText>
          <ThemedText style={styles.confirmValue}>{parsedResult.amount.toLocaleString('vi-VN')} VND</ThemedText>
        </View>
        <View style={styles.confirmRow}>
          <ThemedText style={styles.confirmLabel}>Danh mục:</ThemedText>
          <ThemedText style={styles.confirmValue}>{parsedResult.category}</ThemedText>
        </View>
        <View style={styles.confirmRow}>
          <ThemedText style={styles.confirmLabel}>Ngày:</ThemedText>
          <ThemedText style={styles.confirmValue}>{parsedResult.date}</ThemedText>
        </View>
        <View style={styles.confirmActions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setShowConfirm(false);
              setParsedResult(null);
            }}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.parseButton]}
            onPress={() => {
              setShowConfirm(false);
              setIsEditing(true);
            }}
          >
            <ThemedText style={styles.parseButtonText}>Chỉnh sửa</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.parseButton]}
            onPress={() => {
              setShowConfirm(false);
              handleSave(parsedResult);
            }}
          >
            <ThemedText style={styles.parseButtonText}>Xác nhận</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (isEditing && parsedResult) {
    return (
      <ParsedResultEditor
        transaction={parsedResult}
        originalText={inputText}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Nhập giao dịch bằng tiếng Việt</ThemedText>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <ThemedText style={styles.label}>Mô tả giao dịch</ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="Ví dụ: ăn trưa 50k hôm nay, lương tháng 10 15tr, mua sữa 30k..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={4}
          placeholderTextColor="#9ca3af"
          textContentType="none"
          keyboardType="default"
          autoCapitalize="sentences"
          autoCorrect={true}
        />

        <View style={styles.examples}>
          <ThemedText style={styles.examplesTitle}>Ví dụ:</ThemedText>
          <ThemedText style={styles.example}>ăn trưa 50k hôm nay</ThemedText>
          <ThemedText style={styles.example}>lương tháng 10 15 triệu</ThemedText>
          <ThemedText style={styles.example}>mua sữa 30k sáng nay</ThemedText>
          <ThemedText style={styles.example}>đi taxi 25k về nhà</ThemedText>
        </View>
      </View>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.parseButton, isLoading && styles.parseButtonDisabled]}
          onPress={handleParse}
          disabled={isLoading}
        >
          {isLoading ? (
            <ThemedText style={styles.parseButtonText}>Đang phân tích...</ThemedText>
          ) : (
            <>
              <IconSymbol name="wand.and.stars" size={20} color="#ffffff" />
              <ThemedText style={styles.parseButtonText}>Phân tích</ThemedText>
            </>
          )}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  examples: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  parseButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    gap: 8,
  },
  parseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  parseButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmLabel: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '600',
  },
  confirmValue: {
    fontSize: 15,
    color: '#111827',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
});