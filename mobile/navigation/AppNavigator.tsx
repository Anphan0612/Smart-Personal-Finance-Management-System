import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { RootStackParamList } from './types';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                    name="AddTransaction"
                    component={AddTransactionScreen}
                    options={{ presentation: 'modal', headerShown: true, title: 'Add Transaction' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
