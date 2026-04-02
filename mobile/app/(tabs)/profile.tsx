import React, { useState } from "react";
import { View, ScrollView, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Award, Bell, Moon, DollarSign, ChevronRight, Lock, Fingerprint, LogOut, Home, Utensils, PartyPopper } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { AtelierTypography, AtelierCard } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";

export default function ProfileScreen() {
  const logout = useAppStore((s) => s.logout);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [totalBudget, setTotalBudget] = useState(4850);

  const budgetItems = [
    { icon: Utensils, label: "Food", amount: 850, max: 2000, bgColor: "bg-primary-container/10", color: "#005ab4" },
    { icon: Home, label: "Rent", amount: 2200, max: 4000, bgColor: "bg-secondary-container/10", color: "#465f89" },
    { icon: PartyPopper, label: "Fun & Leisure", amount: 450, max: 1500, bgColor: "bg-tertiary-container/10", color: "#964400" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="items-center mb-10"
        >
          <AtelierTypography variant="h1" className="text-3xl font-extrabold mb-2">
            Julian Alexander
          </AtelierTypography>
          <View className="flex-row items-center px-3 py-1 bg-secondary-container/20 rounded-full">
            <Award size={12} color="#465f89" fill="#465f89" className="mr-1.5" />
            <AtelierTypography variant="label" className="text-[10px] text-secondary">
              Premium Member
            </AtelierTypography>
          </View>
        </MotiView>

        {/* Budget Setup */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <AtelierTypography variant="h3" className="text-xl">Budget Setup</AtelierTypography>
            <TouchableOpacity><AtelierTypography variant="label" className="text-primary normal-case">Save Changes</AtelierTypography></TouchableOpacity>
          </View>
          
          <AtelierCard elevation="lowest" padding="lg" className="mb-4">
             <View className="flex-row justify-between items-end mb-4">
                <AtelierTypography variant="label" className="text-surface-on-variant text-[10px]">
                  Total Monthly Budget
                </AtelierTypography>
                <AtelierTypography variant="h3" className="text-primary text-2xl">${totalBudget.toLocaleString()}</AtelierTypography>
             </View>
             <Slider
               style={{ width: '100%', height: 40 }}
               minimumValue={1000}
               maximumValue={10000}
               step={50}
               value={totalBudget}
               onValueChange={setTotalBudget}
               minimumTrackTintColor="#005ab4"
               maximumTrackTintColor="#ecedf7"
               thumbTintColor="#005ab4"
             />
             <View className="flex-row justify-between">
                <AtelierTypography variant="caption" className="text-[10px]">$1,000</AtelierTypography>
                <AtelierTypography variant="caption" className="text-[10px]">$10,000</AtelierTypography>
             </View>
          </AtelierCard>

          <View className="gap-4">
            {budgetItems.map((item, idx) => (
              <AtelierCard key={idx} elevation="lowest" padding="md">
                <View className="flex-row items-center gap-4 mb-4">
                  <View className={`w-10 h-10 rounded-full ${item.bgColor} items-center justify-center`}>
                     <item.icon size={20} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <AtelierTypography variant="label" className="text-surface-on-variant text-[10px]">{item.label}</AtelierTypography>
                    <AtelierTypography variant="h3" className="text-lg">${item.amount}</AtelierTypography>
                  </View>
                </View>
                <Slider
                  style={{ width: '100%', height: 20 }}
                  minimumValue={0}
                  maximumValue={item.max}
                  value={item.amount}
                  minimumTrackTintColor={item.color}
                  maximumTrackTintColor="#ecedf7"
                  thumbTintColor={item.color}
                />
              </AtelierCard>
            ))}
          </View>
        </View>

        {/* App Settings */}
        <View className="mb-10">
          <AtelierTypography variant="h3" className="text-xl mb-4 px-1">App Settings</AtelierTypography>
          <AtelierCard elevation="lowest" padding="none">
            {[
              { icon: Bell, label: "Notifications", type: "toggle", value: notifications, setter: setNotifications },
              { icon: Moon, label: "Dark Mode", type: "toggle", value: darkMode, setter: setDarkMode },
              { icon: DollarSign, label: "Currency", type: "value", display: "USD ($)" },
            ].map((item, idx, arr) => (
              <View key={idx} className={`p-4 flex-row items-center justify-between ${idx !== arr.length - 1 ? "border-b border-surface-container" : ""}`}>
                <View className="flex-row items-center gap-4">
                  <item.icon size={20} color="#717785" />
                  <AtelierTypography variant="body" className="text-surface-on font-medium">{item.label}</AtelierTypography>
                </View>
                {item.type === "toggle" ? (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={item.setter}
                    trackColor={{ false: "#ecedf7", true: "#005ab4" }}
                    thumbColor="white"
                  />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <AtelierTypography variant="label" className="text-primary font-bold normal-case">{item.display}</AtelierTypography>
                    <ChevronRight size={16} color="#717785" />
                  </View>
                )}
              </View>
            ))}
          </AtelierCard>
        </View>

        {/* Security */}
        <View className="mb-10">
          <AtelierTypography variant="h3" className="text-xl mb-4 px-1">Security</AtelierTypography>
          <View className="gap-3">
            {[
              { icon: Lock, label: "Change PIN" },
              { icon: Fingerprint, label: "Biometric Login", status: "Enabled" },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} className="bg-surface-container-lowest p-4 rounded-2xl flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center gap-4">
                  <item.icon size={20} color="#717785" />
                  <AtelierTypography variant="body" className="text-surface-on font-medium">{item.label}</AtelierTypography>
                </View>
                <View className="flex-row items-center gap-2">
                  {item.status && (
                    <AtelierTypography variant="label" className="text-secondary text-[10px]">{item.status}</AtelierTypography>
                  )}
                  <ChevronRight size={16} color="#717785" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Action */}
        <TouchableOpacity 
          onPress={logout}
          className="w-full py-4 flex-row items-center justify-center gap-2 border-2 border-dashed border-error/20 rounded-2xl bg-error/5"
        >
          <LogOut size={20} color="#ba1a1a" />
          <AtelierTypography variant="h3" className="text-error text-lg">Sign Out of Atelier</AtelierTypography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
