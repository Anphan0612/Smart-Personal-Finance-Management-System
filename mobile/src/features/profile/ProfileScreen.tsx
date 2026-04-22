import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Switch, Platform, Alert } from "react-native";
import { MotiView } from "moti";
import { 
  Bell, 
  Moon, 
  DollarSign, 
  ChevronRight, 
  Lock, 
  Fingerprint, 
  LogOut,
  User,
  ShieldCheck,
  Smartphone
} from "lucide-react-native";
import { useAppStore } from "../../store/useAppStore";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AtelierTypography,
  AtelierCard,
  AtelierButton
} from "@/components/ui";
import { Colors } from "@/constants/tokens";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAppStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi Atelier Finance?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đăng xuất", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login" as any);
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-surface-lowest">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 88, paddingHorizontal: 24, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="items-center mb-12"
        >
          <View
            className="w-28 h-28 rounded-[40px] items-center justify-center mb-5 shadow-atelier-low bg-white"
          >
            <View className="w-24 h-24 bg-primary/5 rounded-[36px] items-center justify-center">
              <AtelierTypography variant="h1" className="text-4xl text-primary">
                {user.name?.substring(0, 1).toUpperCase() || "A"}
              </AtelierTypography>
            </View>
          </View>
          <AtelierTypography variant="h1" className="mb-1">
            {user.name || "Người dùng Atelier"}
          </AtelierTypography>
          <AtelierTypography variant="body" className="text-neutral-400">
            {user.email || "user@atelier.finance"}
          </AtelierTypography>
          
          <TouchableOpacity
            className="mt-6 bg-white px-6 py-2.5 rounded-2xl shadow-atelier-low"
            activeOpacity={0.7}
          >
            <AtelierTypography variant="label" className="text-primary font-bold">CHỈNH SỬA HỒ SƠ</AtelierTypography>
          </TouchableOpacity>
        </MotiView>

        {/* App Settings */}
        <View className="mb-10">
          <View className="flex-row items-center gap-2 mb-5 px-1">
            <Smartphone size={18} color={Colors.neutral[400]} />
            <AtelierTypography variant="h2" className="text-lg">Ứng dụng</AtelierTypography>
          </View>
          
          <AtelierCard padding="none" className="bg-white shadow-atelier-low overflow-hidden">
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center">
                  <Bell size={20} color={Colors.primary.DEFAULT} />
                </View>
                <AtelierTypography variant="h3">Thông báo</AtelierTypography>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.neutral[100], true: Colors.primary.DEFAULT }}
                thumbColor={Platform.OS === "ios" ? "#ffffff" : "#ffffff"}
              />
            </View>

            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center">
                  <Moon size={20} color="#6366f1" />
                </View>
                <AtelierTypography variant="h3">Chế độ tối</AtelierTypography>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: Colors.neutral[100], true: Colors.primary.DEFAULT }}
                thumbColor={Platform.OS === "ios" ? "#ffffff" : "#ffffff"}
              />
            </View>
            
            <TouchableOpacity className="flex-row items-center justify-between p-5" activeOpacity={0.6}>
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center">
                  <DollarSign size={20} color="#10b981" />
                </View>
                <AtelierTypography variant="h3">Tiền tệ</AtelierTypography>
              </View>
              <View className="flex-row items-center">
                <AtelierTypography variant="label" className="text-emerald-600 font-bold mr-2">VNĐ (đ)</AtelierTypography>
                <ChevronRight size={16} color={Colors.neutral[300]} />
              </View>
            </TouchableOpacity>
          </AtelierCard>
        </View>

        {/* Security */}
        <View className="mb-12">
          <View className="flex-row items-center gap-2 mb-5 px-1">
            <ShieldCheck size={18} color={Colors.neutral[400]} />
            <AtelierTypography variant="h2" className="text-lg">Bảo mật</AtelierTypography>
          </View>
          
          <View className="gap-4">
            <TouchableOpacity activeOpacity={0.7}>
              <AtelierCard padding="md" className="bg-white flex-row items-center justify-between shadow-atelier-low">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-amber-50 rounded-2xl items-center justify-center">
                    <Lock size={20} color="#f59e0b" />
                  </View>
                  <AtelierTypography variant="h3">Thay đổi mã PIN</AtelierTypography>
                </View>
                <ChevronRight size={16} color={Colors.neutral[300]} />
              </AtelierCard>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <AtelierCard padding="md" className="bg-white flex-row items-center justify-between shadow-atelier-low">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-purple-50 rounded-2xl items-center justify-center">
                    <Fingerprint size={20} color="#8b5cf6" />
                  </View>
                  <AtelierTypography variant="h3">Xác thực sinh trắc học</AtelierTypography>
                </View>
                <View className="flex-row items-center">
                  <AtelierTypography variant="label" className="text-purple-600 font-bold mr-2 uppercase">ĐÃ BẬT</AtelierTypography>
                  <ChevronRight size={16} color={Colors.neutral[300]} />
                </View>
              </AtelierCard>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Action */}
        <AtelierButton
          variant="error"
          label="ĐĂNG XUẤT KHỎI ATELIER"
          onPress={handleLogout}
          fullWidth
          className="rounded-[24px]"
        />
        
        <View className="mt-10 items-center">
          <AtelierTypography variant="caption" className="text-neutral-300">Phiên bản 1.0.0 (Build 2026)</AtelierTypography>
        </View>
      </ScrollView>
    </View>
  );
}
