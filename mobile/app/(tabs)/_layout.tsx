import React, { useState } from "react";
import { Tabs } from "expo-router";
import { useColorScheme, Platform, View, StyleSheet } from "react-native";
import {
  Home,
  BarChart3,
  PiggyBank,
  Receipt,
  User,
} from "lucide-react-native";
import { Colors } from "../../constants/tokens";
import { AIChatButton } from "../../components/common/AIChatButton";
import { AtelierAI } from "../../components/ui";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const activeColor = isDark ? "#4da1f2" : Colors.primary.DEFAULT;
  const inactiveColor = isDark ? "#5e6068" : Colors.neutral[400];

  return (
    <View style={styles.root}>
      {/* 1. Main Navigation */}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: activeColor,
            tabBarInactiveTintColor: inactiveColor,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              borderTopWidth: 0,
              elevation: 0,
              height: Platform.OS === "ios" ? 88 : 64,
              paddingBottom: Platform.OS === "ios" ? 28 : 8,
              paddingTop: 8,
              borderRadius: 24,
              marginHorizontal: 16,
              marginBottom: Platform.OS === "ios" ? 0 : 12,
              position: "absolute",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              zIndex: 0,
            },
            tabBarLabelStyle: {
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              marginTop: 2,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <View className="items-center justify-center">
                   <Home size={size} color={color} strokeWidth={2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: "Analytics",
              tabBarIcon: ({ color, size }) => (
                <View className="items-center justify-center">
                   <BarChart3 size={size} color={color} strokeWidth={2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="budget"
            options={{
              title: "Budget",
              tabBarIcon: ({ color, size }) => (
                <View className="items-center justify-center">
                   <PiggyBank size={size} color={color} strokeWidth={2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: "History",
              tabBarIcon: ({ color, size }) => (
                <View className="items-center justify-center">
                   <Receipt size={size} color={color} strokeWidth={2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <View className="items-center justify-center">
                   <User size={size} color={color} strokeWidth={2} />
                </View>
              ),
            }}
          />
        </Tabs>
      </View>

      {/* 2. Global Floating Button Layer */}
      <View style={styles.floatingLayer} pointerEvents="box-none">
        <AIChatButton onPress={() => setIsAIModalOpen(true)} />
      </View>

      {/* 3. Global AI Modal Layer */}
      <AtelierAI 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 20,
  },
});
