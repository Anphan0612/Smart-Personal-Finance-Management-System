import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/colors';
import { MOCK_BUDGETS } from '../services/mockData';
import { ProgressBar } from '../components/Budget/ProgressBar';

interface BudgetCardProps {
    category: string;
    spent: number;
    limit: number;
}

const BudgetCard = ({ category, spent, limit }: BudgetCardProps) => {
    const progress = spent / limit;
    const isOverBudget = progress > 1;
    const isNearLimit = progress > 0.8;

    let barColor = Colors.primary;
    if (isOverBudget) barColor = Colors.danger;
    else if (isNearLimit) barColor = Colors.warning;
    else barColor = Colors.success;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.category}>{category}</Text>
                <Text style={[styles.percent, { color: barColor }]}>
                    {Math.round(progress * 100)}%
                </Text>
            </View>

            <View style={styles.amounts}>
                <Text style={styles.spent}>${spent.toFixed(0)}</Text>
                <Text style={styles.limit}> / ${limit.toFixed(0)}</Text>
            </View>

            <ProgressBar progress={progress} color={barColor} height={10} />

            {isOverBudget && (
                <Text style={styles.warningText}>Over Budget!</Text>
            )}
        </View>
    );
};

export const BudgetScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>Monthly Budget</Text>
            </View>

            <FlatList
                data={MOCK_BUDGETS}
                keyExtractor={item => item.category}
                renderItem={({ item }) => (
                    <BudgetCard
                        category={item.category}
                        spent={item.spent}
                        limit={item.limit}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    pageHeader: {
        padding: Spacing.md,
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    listContent: {
        padding: Spacing.md,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    percent: {
        fontWeight: 'bold',
    },
    amounts: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    spent: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
    },
    limit: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    warningText: {
        color: Colors.danger,
        fontSize: 12,
        marginTop: Spacing.xs,
        fontWeight: '500',
    }
});
