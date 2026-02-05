import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface ActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

const ActionButton = ({ icon, label, onPress, color = Theme.colors.primary }: ActionButtonProps) => (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
);

export const QuickActions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quick Actions</Text>
            <View style={styles.row}>
                <ActionButton
                    icon="add"
                    label="Add Txn"
                    onPress={() => navigation.navigate('AddTransaction')}
                />
                <ActionButton
                    icon="wallet"
                    label="Top Up"
                    onPress={() => console.log('Top Up')}
                    color={Theme.colors.success}
                />
                <ActionButton
                    icon="share"
                    label="Send"
                    onPress={() => console.log('Send')}
                    color={Theme.colors.secondary}
                />
                <ActionButton
                    icon="stats-chart"
                    label="Report"
                    onPress={() => console.log('Report')} // Placeholder for Report
                    color={Theme.colors.warning}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Theme.spacing.md,
        marginBottom: Theme.spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '22%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: Theme.borderRadius.xl, // Squircle
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.xs,
    },
    label: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
        fontWeight: '500',
    },
});
