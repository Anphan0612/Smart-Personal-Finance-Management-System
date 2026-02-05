import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { MOCK_CONTACTS } from '../../services/mockData';

export const SendAgain = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Send Again</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {MOCK_CONTACTS.map((person) => (
                    <TouchableOpacity key={person.id} style={styles.personContainer}>
                        <Image source={{ uri: person.avatar }} style={styles.avatar} />
                        <Text style={styles.name}>{person.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: Theme.spacing.lg,
        marginBottom: 100, // Space for Bottom Tab
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    seeAll: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.md,
    },
    personContainer: {
        marginRight: Theme.spacing.lg,
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eee',
        marginBottom: 8,
    },
    name: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
        fontWeight: '500',
    },
});
