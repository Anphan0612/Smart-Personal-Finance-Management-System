import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert } from "react-native";
import { MotiView } from "moti";
import Slider from "@react-native-community/slider";
import { 
  Award, 
  Bell, 
  Moon, 
  DollarSign, 
  ChevronRight, 
  Lock, 
  Fingerprint, 
  LogOut, 
  Utensils
} from "lucide-react-native";
import { useAppStore } from "../../store/useAppStore";
import { router } from "expo-router";
import { formatCurrency } from "../../utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAppStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [totalBudget, setTotalBudget] = useState(15000000);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of Atelier Finance?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Section */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="items-center mb-10"
      >
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4 border border-primary/20">
          <Text className="text-3xl font-extrabold text-primary">
            {user.name?.substring(0, 1).toUpperCase() || "A"}
          </Text>
        </View>
        <Text className="text-3xl font-extrabold tracking-tight text-on-surface font-headline mb-1">
          {user.name || "Atelier User"}
        </Text>
        <Text className="text-sm font-medium text-on-surface-variant mb-4">
          {user.email || "user@atelier.finance"}
        </Text>
      </MotiView>

      {/* Budget Setup placeholder */}
      <View className="mb-10">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold font-headline text-on-surface">Monthly Limit</Text>
          <TouchableOpacity>
            <Text className="text-sm font-bold text-primary">Edit</Text>
          </TouchableOpacity>
        </View>
        
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-[24px] shadow-sm mb-6 border border-outline/5"
        >
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Target Spending
            </Text>
            <Text className="text-2xl font-extrabold text-primary">{formatCurrency(totalBudget)}</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={5000000}
            maximumValue={100000000}
            step={500000}
            value={totalBudget}
            onValueChange={setTotalBudget}
            minimumTrackTintColor="#005ab4"
            maximumTrackTintColor="#f2f3fd"
            thumbTintColor="#005ab4"
          />
        </MotiView>
      </View>

      {/* App Settings */}
      <View className="mb-10">
        <Text className="text-xl font-bold font-headline text-on-surface px-1 mb-4">App Settings</Text>
        <View className="bg-white rounded-[24px] shadow-sm border border-outline/5 overflow-hidden">
          <View className="flex-row items-center justify-between p-5 border-b border-surface-container">
            <View className="flex-row items-center gap-4">
              <Bell size={20} color="#717785" />
              <Text className="font-bold text-on-surface">Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#ecedf7", true: "#005ab4" }}
              thumbColor={Platform.OS === "ios" ? "#ffffff" : notifications ? "#ffffff" : "#f4f3f4"}
            />
          </View>
          <View className="flex-row items-center justify-between p-5 border-b border-surface-container">
            <View className="flex-row items-center gap-4">
              <Moon size={20} color="#717785" />
              <Text className="font-bold text-on-surface">Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#ecedf7", true: "#005ab4" }}
            />
          </View>
          <TouchableOpacity className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center gap-4">
              <DollarSign size={20} color="#717785" />
              <Text className="font-bold text-on-surface">Currency</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-primary font-bold text-sm mr-2">VNĐ (đ)</Text>
              <ChevronRight size={16} color="#717785" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security */}
      <View className="mb-10">
        <Text className="text-xl font-bold font-headline text-on-surface px-1 mb-4">Security</Text>
        <View className="gap-3">
          <TouchableOpacity className="bg-white p-5 rounded-[24px] flex-row items-center justify-between shadow-sm border border-outline/5">
            <View className="flex-row items-center gap-4">
              <Lock size={20} color="#717785" />
              <Text className="font-bold text-on-surface">Change PIN</Text>
            </View>
            <ChevronRight size={16} color="#717785" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white p-5 rounded-[24px] flex-row items-center justify-between shadow-sm border border-outline/5">
            <View className="flex-row items-center gap-4">
              <Fingerprint size={20} color="#717785" />
              <Text className="font-bold text-on-surface">Biometric Login</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[10px] font-bold uppercase text-secondary mr-2">Enabled</Text>
              <ChevronRight size={16} color="#717785" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity 
        onPress={handleLogout}
        className="w-full py-5 border-2 border-dashed border-error/20 rounded-[24px] flex-row items-center justify-center gap-2"
      >
        <LogOut size={20} color="#ba1a1a" />
        <Text className="text-error font-bold text-lg font-headline">Sign Out of Atelier</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
