import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export const AddTransactionScreen = () => {
    const navigation = useNavigation();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }
        // Mock Save
        Alert.alert('Success', 'Transaction saved (Mock)!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* Type Selector */}
            <View style={styles.typeContainer}>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'expense' && styles.typeButtonActive, { borderColor: Colors.danger }]}
                    onPress={() => setType('expense')}
                >
                    <Text style={[styles.typeText, type === 'expense' && { color: Colors.danger }]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'income' && styles.typeButtonActive, { borderColor: Colors.success }]}
                    onPress={() => setType('income')}
                >
                    <Text style={[styles.typeText, type === 'income' && { color: Colors.success }]}>Income</Text>
                </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.amountInputContainer}>
                    <Text style={styles.currency}>$</Text>
                    <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>
            </View>

            {/* Category Picker */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Food" value="Food" />
                        <Picker.Item label="Transport" value="Transport" />
                        <Picker.Item label="Utilities" value="Utilities" />
                        <Picker.Item label="Shopping" value="Shopping" />
                        <Picker.Item label="Salary" value="Salary" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                </View>
            </View>

            {/* Date Picker */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Note</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Description (optional)"
                    value={note}
                    onChangeText={setNote}
                />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Transaction</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.md,
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
    },
    typeButton: {
        flex: 1,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        marginHorizontal: Spacing.xs,
        borderRadius: BorderRadius.md,
    },
    typeButtonActive: {
        backgroundColor: Colors.card,
        borderWidth: 2,
    },
    typeText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.textSecondary,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 60,
    },
    currency: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginRight: Spacing.sm,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    pickerContainer: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    picker: {
        height: 50,
    },
    dateButton: {
        padding: Spacing.md,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dateText: {
        fontSize: 16,
        color: Colors.text,
    },
    input: {
        backgroundColor: Colors.card,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
        color: Colors.text,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
