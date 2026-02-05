import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { HeaderBackground } from '../components/Dashboard/HeaderBackground';
import { BalanceCard } from '../components/Dashboard/BalanceCard';
import { SendAgain } from '../components/Dashboard/SendAgain';
import { TransactionItem } from '../components/History/TransactionItem';
import { MOCK_SUMMARY, MOCK_TRANSACTIONS } from '../services/mockData';
import { Colors, Spacing } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    // Using static mock data for now
    const { totalBalance, monthlyIncome, monthlyExpense } = MOCK_SUMMARY;
    const recentTransactions = MOCK_TRANSACTIONS.slice(0, 4); // Show top 4

    return (
        <View style={styles.container}>
            {/* Absolute Header is inside HeaderBackground */}
            <HeaderBackground />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Balance Card sits on top of Header */}
                <BalanceCard
                    balance={totalBalance}
                    income={monthlyIncome}
                    expense={monthlyExpense}
                />

                {/* Transactions Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transactions History</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('History')}>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listContainer}>
                    {recentTransactions.map(t => (
                        <TransactionItem key={t.id} transaction={t} />
                    ))}
                </View>

                {/* Send Again Section */}
                <SendAgain />

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingTop: 80, // Push content down so Card overlaps Header nicely. Header is 280h. 
        // Wait, Card has marginTop 20. Header absolute.
        // We need to push content so valid content starts below Header's top area.
        // Card is inside ScrollView.
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    seeAll: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    listContainer: {
        paddingHorizontal: Spacing.xs, // Items have their own padding
    }
});
