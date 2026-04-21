import React, { useState } from "react";
import { View, ScrollView, Platform, Image, Alert, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { poster } from "../../services/api";
import { AuthenticationResponse } from "../../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AtelierTypography, AtelierInput, AtelierButton } from "../../components/ui";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setTokens = useAppStore((state) => state.setTokens);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`[AUTH] Đang đăng nhập cho ${email}...`);

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
      const message = error.response?.data?.message || "Thông tin đăng nhập không chính xác.";
      Alert.alert("Đăng nhập thất bại", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-container-lowest"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-sm mx-auto gap-y-10">
        {/* Brand Identity Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.5, rotate: '-45deg' }}
          animate={{ opacity: 1, scale: 1, rotate: '3deg' }}
          transition={{ type: 'spring', duration: 1000 }}
          className="items-center"
        >
          <LinearGradient
            colors={["#1275e2", "#0b4f9e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-16 h-16 rounded-[20px] items-center justify-center shadow-lg mb-4"
          >
            <Image
              source={require("../../../assets/images/icon.png")}
              className="w-10 h-10"
              style={{ tintColor: 'white' }}
            />
          </LinearGradient>
          <View className="items-center">
            <AtelierTypography variant="h1" className="text-primary text-3xl">
              Atelier Finance
            </AtelierTypography>
            <AtelierTypography variant="h3" className="text-neutral-500 mt-1">
              Chào mừng trở lại
            </AtelierTypography>
          </View>
        </MotiView>

        {/* Main Form Canvas */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          className="bg-white p-8 rounded-[32px] shadow-atelier-low gap-y-6"
        >
          {/* Email Field */}
          <AtelierInput
            label="Địa chỉ Email"
            placeholder="name@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color="#74777f" />}
          />

          {/* Password Field */}
          <View className="gap-y-2">
            <AtelierInput
              label="Mật khẩu"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color="#74777f" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="#74777f" /> : <Eye size={18} color="#74777f" />}
                </TouchableOpacity>
              }
            />
            <TouchableOpacity className="self-end px-1">
              <AtelierTypography variant="caption" className="text-primary font-bold">
                Quên mật khẩu?
              </AtelierTypography>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <AtelierButton
            label="Đăng nhập"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            className="mt-2"
          />

          {/* Divider */}
          <View className="flex-row items-center py-2">
            <View className="flex-1 h-[1.5px] bg-neutral-100" />
            <AtelierTypography variant="label" className="px-4 text-[10px] text-neutral-400">
              HOẶC TIẾP TỤC VỚI
            </AtelierTypography>
            <View className="flex-1 h-[1.5px] bg-neutral-100" />
          </View>

          {/* Social Logins */}
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-4 bg-surface-container-low rounded-[16px] border border-neutral-100">
              <Image
                source={{ uri: "https://www.google.com/favicon.ico" }}
                className="w-5 h-5 mr-3"
              />
              <AtelierTypography variant="label" className="text-neutral-900 border-none">Google</AtelierTypography>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-4 bg-surface-container-low rounded-[16px] border border-neutral-100">
              <AtelierTypography variant="label" className="text-neutral-900 border-none">Apple ID</AtelierTypography>
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
          <AtelierTypography variant="body" className="text-neutral-500">
            Chưa có tài khoản?{" "}
            <AtelierTypography
              variant="body"
              className="text-primary font-bold"
              onPress={() => router.push("/register" as any)}
            >
              Đăng ký ngay
            </AtelierTypography>
          </AtelierTypography>
        </MotiView>
      </View>
    </ScrollView>
  );
}
