import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, SafeAreaView } from 'react-native';
import { Colors, Spacing } from '../constants/colors';
import { MOCK_TRANSACTIONS } from '../services/mockData';
import { TransactionItem } from '../components/History/TransactionItem';
import { Ionicons } from '@expo/vector-icons';

export const HistoryScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState(MOCK_TRANSACTIONS);

    // Simple filter logic
    const filteredData = data.filter(item =>
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.note.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Transactions</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TransactionItem transaction={item} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No transactions found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        margin: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 48,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    listContent: {
        padding: Spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    }
});
