import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/colors';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
}

export const ProgressBar = ({ progress, color = Colors.primary, height = 8 }: ProgressBarProps) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    return (
        <View style={[styles.container, { height }]}>
            <View
                style={[
                    styles.fill,
                    {
                        width: `${clampedProgress * 100}%`,
                        backgroundColor: color
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.border,
        borderRadius: BorderRadius.round,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: BorderRadius.round,
    },
});
