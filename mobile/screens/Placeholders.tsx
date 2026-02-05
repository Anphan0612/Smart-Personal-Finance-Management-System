// Placeholder screens
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{name} Screen</Text>
    </View>
);

export const AddTransactionScreen = () => <PlaceholderScreen name="Add Transaction" />;
export const BudgetScreen = () => <PlaceholderScreen name="Budget" />;
export const HistoryScreen = () => <PlaceholderScreen name="Transactions" />; // Renaming for tab
export const WalletScreen = () => <PlaceholderScreen name="Wallet" />;
export const ProfileScreen = () => <PlaceholderScreen name="Profile" />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
