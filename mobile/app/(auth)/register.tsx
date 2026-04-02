import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { MotiView } from "moti";
import { User, Mail, Lock, Phone, CreditCard, ArrowLeft, ArrowRight } from "lucide-react-native";
import { AtelierTypography, AtelierInput, AtelierButton } from "../../components/ui";
import { Colors } from "../../constants/tokens";
import { poster } from "../../services/api";

import { useAppStore } from "../../store/useAppStore";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    cccd: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setTokens = useAppStore((state) => state.setTokens);

  const handleRegister = async () => {
    const { username, email, password, phone, cccd } = formData;
    setErrors({});
    
    if (!username || !email || !password || !phone || !cccd) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      console.log("[REGISTER] Attempting registration...");
      const response = await poster<any, any>("/auth/register", formData);
      
      console.log("[REGISTER] Success. Auto-logging in...");
      if (response && response.accessToken) {
        setTokens(response.accessToken, response.refreshToken);
        router.replace("/(tabs)");
      } else {
        // Fallback if tokens are missing
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      console.error("[REGISTER] Error:", error.message);
      
      // Handle field-specific validation errors from BE
      const fieldErrors = error.response?.data?.fieldErrors;
      if (fieldErrors && Array.isArray(fieldErrors)) {
        const newErrors: Record<string, string> = {};
        fieldErrors.forEach((err: any) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        const message = error.response?.data?.message || "Registration failed. Try again.";
        Alert.alert("Registration Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface-light dark:bg-surface-dark"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity className="mb-8" onPress={() => router.back()}>
           <ArrowLeft size={24} color={Colors.neutral[500]} />
        </TouchableOpacity>
 
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="bg-white dark:bg-surface-card-dark p-8 rounded-[40px] shadow-xl shadow-black/5"
        >
          <AtelierTypography variant="h2" className="mb-2 text-center text-primary">Join the Atelier</AtelierTypography>
          <AtelierTypography variant="body" className="mb-8 text-center text-neutral-400">
             Start your luxury financial journey
          </AtelierTypography>
          
          <View className="gap-5">
            <AtelierInput 
              label="Username"
              placeholder="atelier_user"
              value={formData.username}
              onChangeText={(val) => updateField("username", val)}
              leftIcon={<User size={20} color={Colors.neutral[400]} />}
              error={errors.username}
            />
 
            <AtelierInput 
              label="Email Address"
              placeholder="user@atelier.com"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(val) => updateField("email", val)}
              leftIcon={<Mail size={20} color={Colors.neutral[400]} />}
              error={errors.email}
            />
 
            <AtelierInput 
              label="Phone Number"
              placeholder="0912 345 678"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(val) => updateField("phone", val)}
              leftIcon={<Phone size={20} color={Colors.neutral[400]} />}
              error={errors.phone}
            />
 
            <AtelierInput 
              label="CCCD / Identity Number"
              placeholder="12-digit number"
              keyboardType="numeric"
              maxLength={12}
              value={formData.cccd}
              onChangeText={(val) => updateField("cccd", val)}
              leftIcon={<CreditCard size={20} color={Colors.neutral[400]} />}
              error={errors.cccd}
            />
 
            <AtelierInput 
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={formData.password}
              onChangeText={(val) => updateField("password", val)}
              leftIcon={<Lock size={20} color={Colors.neutral[400]} />}
              error={errors.password}
            />

            <AtelierButton 
              label="Create Account" 
              onPress={handleRegister}
              loading={loading}
              className="mt-6"
            />
          </View>

          <View className="flex-row justify-center items-center mt-8 gap-2">
            <AtelierTypography variant="body" className="text-neutral-400">Already a member?</AtelierTypography>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <AtelierTypography variant="body" className="text-primary font-bold">Sign In</AtelierTypography>
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
