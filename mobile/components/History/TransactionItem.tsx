import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Theme } from '../../constants/theme';
import { Transaction } from '../../services/mockData';
import { Ionicons } from '@expo/vector-icons';

interface TransactionItemProps {
    transaction: Transaction;
    onPress?: () => void;
}

// Helper to get icon/color based on category name (Mock logic)
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Food': return { icon: 'fast-food', bg: '#EBF3FF', color: '#007AFF' } as const; // Blue
        case 'Shopping': return { icon: 'cart', bg: '#FFF8EC', color: '#FFB800' } as const; // Orange
        case 'Transport': return { icon: 'car', bg: '#F2F2F2', color: '#333' } as const; // Gray
        case 'Salary': return { icon: 'cash', bg: '#EAFFEA', color: '#4CAF50' } as const; // Green
        case 'Utilities': return { icon: 'flash', bg: '#FFF4E5', color: '#FF9800' } as const; // Orange
        default: return { icon: 'wallet', bg: '#F2F2F2', color: '#666' } as const;
    }
}

// Simulating logos from screenshot (Upwork, Paypal, etc) based on Note/Title or data
const getLogo = (transaction: Transaction) => {
    if (transaction.logo) return transaction.logo;
    const note = transaction.note.toLowerCase();
    if (note.includes('upwork')) return 'https://logo.clearbit.com/upwork.com';
    if (note.includes('paypal')) return 'https://logo.clearbit.com/paypal.com';
    if (note.includes('youtube')) return 'https://logo.clearbit.com/youtube.com';
    return null;
}

export const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
    const isIncome = transaction.type === 'income';
    const logoUrl = getLogo(transaction);
    const { icon, bg, color } = getCategoryIcon(transaction.category);

    // Format Date
    const dateObj = new Date(transaction.date);
    const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isToday = new Date().toDateString() === dateObj.toDateString();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: logoUrl ? '#fff' : bg }]}>
                {logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <Ionicons name={icon} size={20} color={color} />
                )}
            </View>

            <View style={styles.details}>
                <Text style={styles.title}>{transaction.note || transaction.category}</Text>
                <Text style={styles.date}>{isToday ? 'Today' : dateString}</Text>
            </View>

            <Text style={[styles.amount, { color: isIncome ? Theme.colors.success : Theme.colors.danger }]}>
                {isIncome ? '+' : '-'} $ {transaction.amount.toFixed(2)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.md,
        backgroundColor: Theme.colors.card, // White card
        marginBottom: Theme.spacing.sm,
        borderRadius: Theme.borderRadius.lg, // Rounded corners
        // Design System Shadow (Theme.shadows.small equiv)
        ...Theme.shadows.small
    },
    iconContainer: {
        width: 48, // Slightly larger touch target
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    logo: {
        width: 32,
        height: 32,
    },
    details: {
        flex: 1,
    },
    title: {
        fontSize: Theme.text.size.md,
        fontWeight: '600',
        color: Theme.colors.text, // Zinc-900
        marginBottom: 4,
    },
    date: {
        fontSize: 13,
        color: Theme.colors.textSecondary, // Zinc-500
    },
    amount: {
        fontSize: Theme.text.size.md,
        fontWeight: '600',
    },
});
