import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Image } from "react-native";
import { MotiView } from "moti";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { poster } from "../../services/api";
import { AuthenticationResponse } from "../../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, ActivityIndicator } from "react-native";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setTokens = useAppStore((state) => state.setTokens);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`[AUTH] Attempting registration for ${email}...`);

      const response = await poster<AuthenticationResponse, any>("/auth/register", {
        username: fullName,
        email: email,
        password: password,
      });

      if (response && response.accessToken) {
        Alert.alert("Success", "Account created successfully!");
        setTokens(response.accessToken, response.refreshToken);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("[AUTH ERROR]", error);
      const message = error.response?.data?.message || "Registration failed. Please check your details.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-sm mx-auto space-y-8">
        {/* Brand Identity Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="items-center"
        >
          <LinearGradient
            colors={["#005ab4", "#0873df"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg mb-4"
          >
            <Sparkles size={28} color="white" fill="white" />
          </LinearGradient>
          <Text className="font-headline font-extrabold text-2xl text-on-surface tracking-tight mt-1">
            Create Account
          </Text>
          <Text className="text-on-surface-variant text-sm mt-1">Start your financial journey</Text>
        </MotiView>

        {/* Main Form */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          className="bg-white p-8 rounded-[32px] shadow-sm space-y-5"
        >
          {/* Name Field */}
          <View className="space-y-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-outline px-1">Full Name</Text>
            <View className="bg-surface-container-low rounded-[16px] px-5 py-4 flex-row items-center">
              <User size={18} color="#717785" />
              <TextInput
                className="flex-1 ml-3 text-sm font-medium text-on-surface"
                placeholder="Julian Alexander"
                placeholderTextColor="rgba(113, 119, 133, 0.4)"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          {/* Email Field */}
          <View className="space-y-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-outline px-1">Email Address</Text>
            <View className="bg-surface-container-low rounded-[16px] px-5 py-4 flex-row items-center">
              <Mail size={18} color="#717785" />
              <TextInput
                className="flex-1 ml-3 text-sm font-medium text-on-surface"
                placeholder="name@company.com"
                placeholderTextColor="rgba(113, 119, 133, 0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="space-y-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-outline px-1">Password</Text>
            <View className="bg-surface-container-low rounded-[16px] px-5 py-4 flex-row items-center">
              <Lock size={18} color="#717785" />
              <TextInput
                className="flex-1 ml-3 text-sm font-medium text-on-surface"
                placeholder="Minimum 8 characters"
                placeholderTextColor="rgba(113, 119, 133, 0.4)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#717785" /> : <Eye size={18} color="#717785" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity onPress={handleRegister} activeOpacity={0.9} disabled={isLoading}>
            <LinearGradient
              colors={["#005ab4", "#0873df"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full py-5 rounded-full shadow-lg shadow-primary/20 items-center mt-2"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-headline font-bold text-lg">Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View className="flex-row items-center py-1">
            <View className="flex-1 h-[1px] bg-outline-variant/10" />
            <Text className="px-4 text-[10px] font-bold text-outline uppercase tracking-widest">or</Text>
            <View className="flex-1 h-[1px] bg-outline-variant/10" />
          </View>

          {/* Social Logins */}
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-4 bg-surface rounded-[16px] border border-outline-variant/10">
              <Image source={{ uri: "https://www.google.com/favicon.ico" }} className="w-4 h-4 mr-2" />
              <Text className="font-bold text-[12px] text-on-surface">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-4 bg-surface rounded-[16px] border border-outline-variant/10">
              <Text className="font-bold text-[12px] text-on-surface">Apple</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500 }}
          className="items-center"
        >
          <Text className="text-on-surface-variant text-sm">
            Already have an account?{" "}
            <Text
              className="text-primary font-bold"
              onPress={() => router.push("/login")}
            >
              Sign In
            </Text>
          </Text>
        </MotiView>
      </View>
    </ScrollView>
  );
}
