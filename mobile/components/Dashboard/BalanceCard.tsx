import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
    balance: number;
    income: number;
    expense: number;
}

export const BalanceCard = ({ balance, income, expense }: BalanceCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <TouchableOpacity style={styles.dropdown}>
                        <Text style={styles.label}>Total Balance</Text>
                        <Ionicons name="chevron-down" size={16} color="#B0D8D5" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                    <Text style={styles.balance}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <View style={styles.column}>
                    <View style={styles.indicatorRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="arrow-down" size={14} color="#fff" />
                        </View>
                        <Text style={styles.subLabel}>Income</Text>
                    </View>
                    <Text style={styles.amount}>${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={styles.column}>
                    <View style={[styles.indicatorRow, { justifyContent: 'flex-end' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                            <Ionicons name="arrow-up" size={14} color="#fff" />
                        </View>
                        <Text style={styles.subLabel}>Expenses</Text>
                    </View>
                    <Text style={[styles.amount, { textAlign: 'right' }]}>${expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.cardBackground, // Dark Green
        borderRadius: Theme.borderRadius.xxl,
        padding: Theme.spacing.lg,
        marginHorizontal: Theme.spacing.md,
        marginTop: 20, // To sit on top of the curve
        shadowColor: "#2F7E79",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.xl,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.xs,
    },
    label: {
        color: '#B0D8D5', // Light Teal
        fontSize: Theme.text.size.sm,
        fontWeight: '600',
    },
    balance: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
    },
    indicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    subLabel: {
        color: '#D1EAE8',
        fontSize: Theme.text.size.sm,
    },
    amount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
