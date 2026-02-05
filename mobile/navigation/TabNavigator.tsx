import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { WalletScreen, ProfileScreen } from '../screens/Placeholders';
import { TabParamList } from './types';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar Button for the middle "Add" action
const CustomAddButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity
        style={{
            top: -20,
            justifyContent: 'center',
            alignItems: 'center',
        }}
        onPress={onPress}
    >
        <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Colors.primary,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
        }}>
            <Ionicons name="add" size={32} color="#fff" style={{ marginLeft: 2, marginTop: 2 }} />
        </View>
    </TouchableOpacity>
);

export default function TabNavigator() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: '#BDBDBD',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 8, // Add elevation for Android
                    backgroundColor: '#ffffff',
                    borderTopColor: 'transparent',
                    height: Platform.OS === 'ios' ? 80 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                    shadowColor: '#000', // iOS Shadow
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />
                    )
                }}
            />

            {/* Middle Button - Opens Modal */}
            <Tab.Screen
                name="Add"
                component={DashboardScreen} // Component doesn't matter, overridden by button
                options={{
                    tabBarIcon: () => null,
                    tabBarButton: (props) => (
                        <CustomAddButton onPress={() => navigation.navigate('AddTransaction')} />
                    )
                }}
            />

            <Tab.Screen
                name="Wallet"
                component={WalletScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}
