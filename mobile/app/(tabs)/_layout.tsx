import React, { useState } from "react";
import { Tabs } from "expo-router";
import { useColorScheme, Platform, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  BarChart3,
  PiggyBank,
  Receipt,
  User,
} from "lucide-react-native";
import { AtelierAI } from "../../src/components/ui/AtelierAI";
import { TopBar } from "../../src/components/atelier/TopBar";
import { useAppStore } from "../../src/store/useAppStore";
import { Sparkles } from "lucide-react-native";
import { MotiView } from "moti";
import { TouchableOpacity } from "react-native";

export default function TabLayout() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const { user } = useAppStore();
  const insets = useSafeAreaInsets();

  // Dynamic values
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;
  const tabBarHeight = 64 + bottomPadding;

  return (
    <View style={styles.root}>
      {/* 1. Atelier TopBar */}
      <TopBar title={user?.name || "Atelier Finance"} />

      {/* 2. Main Navigation */}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#005ab4", // primary
            tabBarInactiveTintColor: "#717785", // neutral
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderTopWidth: 1,
              borderTopColor: "rgba(113, 119, 133, 0.08)",
              elevation: 0,
              height: tabBarHeight,
              paddingBottom: bottomPadding,
              paddingTop: 12,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
            },
            tabBarLabelStyle: {
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              marginTop: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: "Analytics",
              tabBarIcon: ({ color, focused }) => (
                <BarChart3 size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="budget"
            options={{
              title: "Saving",
              tabBarIcon: ({ color, focused }) => (
                <PiggyBank size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: "History",
              tabBarIcon: ({ color, focused }) => (
                <Receipt size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, focused }) => (
                <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
        </Tabs>
      </View>

      {/* 3. Global Floating AI Button */}
      {!isAIOpen && (
        <AIAssistantFAB offset={tabBarHeight + 20} onPress={() => setIsAIOpen(true)} />
      )}

      {/* 4. Global AI Assistant Drawer */}
      <AtelierAI 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
      />
    </View>
  );
}

const AIAssistantFAB = ({ onPress, offset }: { onPress: () => void, offset: number }) => {
  return (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", delay: 1000 }}
      style={[styles.fabContainer, { bottom: offset }]}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ loop: true, duration: 3000, type: "timing" }}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
          style={styles.fabButton}
        >
          <Sparkles color="white" size={26} fill="white" />
        </TouchableOpacity>
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f9f9ff", // bg-surface
  },
  content: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    right: 24,
    zIndex: 90,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#005ab4", // primary
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#005ab4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
});
