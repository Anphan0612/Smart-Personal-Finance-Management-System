import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { AtelierTypography, AtelierInput, AtelierButton } from "../../components/ui";
import { Colors } from "../../constants/tokens";
import { useAppStore } from "../../store/useAppStore";
import { poster } from "../../services/api";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const setTokens = useAppStore((state) => state.setTokens);

  const handleLogin = async () => {
    setErrors({});
    if (!username || !password) {
      if (!username) setErrors(prev => ({ ...prev, username: "Username is required" }));
      if (!password) setErrors(prev => ({ ...prev, password: "Password is required" }));
      return;
    }

    console.log(`[LOGIN] Attempting login for: ${username}`);
    setLoading(true);
    try {
      console.log(`[LOGIN] Calling poster...`);
      const response = await poster<any, any>("/auth/login", {
        username,
        password,
      });

      console.log(`[LOGIN] Response received. Data found:`, !!response);

      if (response && response.accessToken) {
        console.log("[LOGIN] Success, Tokens received.");
        setTokens(response.accessToken, response.refreshToken);
        // Chuyển hướng sang TABs
        console.log("[LOGIN] Navigating to (tabs)...");
        router.replace("/(tabs)");
      } else {
        console.warn("[LOGIN] Malformed response:", response);
        Alert.alert("Login Failed", "Malformed response from server.");
      }
    } catch (error: any) {
      console.error("[LOGIN] Exception caught:", error.message);
      
      const fieldErrors = error.response?.data?.fieldErrors;
      if (fieldErrors && Array.isArray(fieldErrors)) {
        const newErrors: Record<string, string> = {};
        fieldErrors.forEach((err: any) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        const message = error.response?.data?.message || "Login failed. Please check your credentials.";
        Alert.alert("Login Failed", message);
      }
    } finally {
      console.log("[LOGIN] Finished.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface-light dark:bg-surface-dark"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 1000 }}
          className="items-center mb-12"
        >
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-2xl shadow-primary/40 rotate-3">
            <Sparkles size={40} color="white" fill="white" />
          </View>
          <AtelierTypography variant="h1" className="mt-6 text-primary tracking-tighter">
            Atelier Finance
          </AtelierTypography>
          <AtelierTypography variant="body" className="text-neutral-500 mt-1">
            Luxury terminal for your wealth
          </AtelierTypography>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          className="bg-white dark:bg-surface-card-dark p-8 rounded-[40px] shadow-xl shadow-black/5"
        >
          <AtelierTypography variant="h3" className="mb-8 text-center">Welcome Back</AtelierTypography>
          
          <View className="gap-6">
            <AtelierInput 
              label="Username or Email"
              placeholder="atelier_user"
              value={username}
              onChangeText={(val) => {
                setUsername(val);
                if (errors.username) setErrors(prev => ({ ...prev, username: "" }));
              }}
              leftIcon={<Mail size={20} color={Colors.neutral[400]} />}
              error={errors.username}
            />

            <View>
              <AtelierInput 
                label="Password"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                }}
                leftIcon={<Lock size={20} color={Colors.neutral[400]} />}
                error={errors.password}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color={Colors.neutral[400]} /> : <Eye size={20} color={Colors.neutral[400]} />}
                  </TouchableOpacity>
                }
              />
              <TouchableOpacity className="self-end mt-2">
                <AtelierTypography variant="label" className="text-primary normal-case">Forgot password?</AtelierTypography>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2">
               <TouchableOpacity 
                 onPress={() => setIsRememberMe(!isRememberMe)}
                 className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${isRememberMe ? "bg-primary border-primary" : "border-neutral-300"}`}
               >
                 {isRememberMe && <View className="w-2 h-2 bg-white rounded-full" />}
               </TouchableOpacity>
               <AtelierTypography variant="label" className="normal-case">Remember me</AtelierTypography>
            </View>

            <AtelierButton 
              label="Sign In" 
              onPress={handleLogin}
              loading={loading}
              className="mt-4"
            />
          </View>

          <View className="flex-row justify-center items-center mt-8 gap-2">
            <AtelierTypography variant="body" className="text-neutral-400">Don't have an account?</AtelierTypography>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <AtelierTypography variant="body" className="text-primary font-bold">Sign Up</AtelierTypography>
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
