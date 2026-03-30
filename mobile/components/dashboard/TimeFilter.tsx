import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface TimeFilterProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export const TimeFilter = ({ options, selected, onSelect }: TimeFilterProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isActive && styles.activeChip]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 4,
    borderRadius: theme.roundness.full,
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.roundness.full,
  },
  activeChip: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    ...theme.shadows.ambient,
  },
  text: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.typography.body.fontFamily,
  },
  activeText: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
});
