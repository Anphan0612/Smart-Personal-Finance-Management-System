import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Image } from "react-native";
import { MotiView } from "moti";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { poster } from "../../services/api";
import { AuthenticationResponse } from "../../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, ActivityIndicator } from "react-native";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setTokens = useAppStore((state) => state.setTokens);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`[AUTH] Attempting login for ${email}...`);

      const response = await poster<AuthenticationResponse, any>("/auth/login", {
        username: email,
        password: password,
      });

      if (response && response.accessToken) {
        setTokens(response.accessToken, response.refreshToken, {
          name: response.name,
          email: response.email,
        });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("[AUTH ERROR]", error);
      const message = error.response?.data?.message || "Invalid credentials. Please try again.";
      Alert.alert("Login Failed", message);
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
      <View className="w-full max-w-sm mx-auto space-y-10">
        {/* Brand Identity Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.5, rotate: '-45deg' }}
          animate={{ opacity: 1, scale: 1, rotate: '3deg' }}
          transition={{ type: 'spring', duration: 1000 }}
          className="items-center"
        >
          <LinearGradient
            colors={["#005ab4", "#0873df"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-16 h-16 rounded-2xl items-center justify-center shadow-lg mb-4"
          >
            <Sparkles size={32} color="white" fill="white" />
          </LinearGradient>
          <View className="items-center">
            <Text className="font-headline font-extrabold text-3xl tracking-tighter text-primary">
              Atelier Finance
            </Text>
            <Text className="font-headline font-bold text-xl text-on-surface tracking-tight mt-1">
              Welcome back
            </Text>
          </View>
        </MotiView>

        {/* Main Form Canvas */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          className="bg-white p-8 rounded-[32px] shadow-sm space-y-6"
        >
          {/* Email Field */}
          <View className="space-y-2">
            <Text className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">
              Email Address
            </Text>
            <View className="bg-surface-container-low rounded-[16px] px-5 py-4 flex-row items-center">
              <Mail size={18} color="#717785" />
              <TextInput
                className="flex-1 ml-3 text-[15px] font-medium text-on-surface"
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
          <View className="space-y-2">
            <View className="flex-row justify-between items-center px-1">
              <Text className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Password
              </Text>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-primary">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-surface-container-low rounded-[16px] px-5 py-4 flex-row items-center">
              <Lock size={18} color="#717785" />
              <TextInput
                className="flex-1 ml-3 text-[15px] font-medium text-on-surface"
                placeholder="••••••••"
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

          {/* Sign In Button */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.9} disabled={isLoading}>
            <LinearGradient
              colors={["#005ab4", "#0873df"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full py-5 rounded-full shadow-lg shadow-primary/20 items-center justify-center mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-headline font-bold text-lg">Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center py-2">
            <View className="flex-1 h-[1px] bg-outline-variant/10" />
            <Text className="px-4 text-[10px] font-bold text-outline uppercase tracking-widest">
              or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-outline-variant/10" />
          </View>

          {/* Social Logins */}
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-4 bg-surface rounded-[16px] border border-outline-variant/10">
              <Image
                source={{ uri: "https://www.google.com/favicon.ico" }}
                className="w-5 h-5 mr-3"
              />
              <Text className="font-bold text-sm text-on-surface">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-4 bg-surface rounded-[16px] border border-outline-variant/10">
              <Text className="font-bold text-sm text-on-surface">Apple</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Footer Call to Action */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 600 }}
          className="items-center"
        >
          <Text className="text-on-surface-variant text-sm">
            Don't have an account?{" "}
            <Text
              className="text-primary font-bold"
              onPress={() => router.push("/register")}
            >
              Sign Up
            </Text>
          </Text>
        </MotiView>
      </View>
    </ScrollView>
  );
}
