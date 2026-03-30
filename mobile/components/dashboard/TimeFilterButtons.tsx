import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {TIME_RANGE_OPTIONS, TimeRange} from '../../constants/dashboard';
import {ThemedText} from '../themed-text';
import {ThemedView} from '../themed-view';

interface TimeFilterButtonsProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  disabled?: boolean;
}

export const TimeFilterButtons: React.FC<TimeFilterButtonsProps> = ({
  selectedRange,
  onRangeChange,
  disabled = false,
}) => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.buttonContainer}>
        {TIME_RANGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              selectedRange === option.value && styles.buttonSelected,
              disabled && styles.buttonDisabled,
            ]}
            onPress={() => !disabled && onRangeChange(option.value)}
            disabled={disabled}
          >
            <ThemedText
              style={[
                styles.buttonText,
                selectedRange === option.value && styles.buttonTextSelected,
                disabled && styles.buttonTextDisabled,
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  buttonTextSelected: {
    color: '#ffffff',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
});