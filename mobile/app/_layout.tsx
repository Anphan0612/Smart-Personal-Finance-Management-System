import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme, LogBox } from "react-native";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import "../global.css";
import { useAppStore } from "../src/store/useAppStore";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const AtelierLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#005ab4",
    background: "#f9f9ff",
    card: "#ffffff",
    text: "#181c22",
    border: "#c1c6d5",
    notification: "#ba1a1a",
  },
};

const AtelierDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#4da1f2",
    background: "#121212",
    card: "#1e1e1e",
    text: "#f3f3f4",
    border: "#32343a",
    notification: "#ff8f1a",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const token = useAppStore((state: any) => state.setToken);
  const currentToken = useAppStore((state: any) => state.token);
  const segments = useSegments();
  const router = useRouter();

  // Đặt true để gỡ chặn route (bypass login) trong quá trình phát triển UI
  const DEBUG_BYPASS_AUTH = false; 
  
  // Khởi tạo QueryClient với các cấu hình an toàn cho Finance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 403 || error?.response?.status === 401) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: true,
        staleTime: 1000 * 30, // Dữ liệu cũ sau 30 giây
      },
    },
  }));

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Auth Guard Logic
  useEffect(() => {
    if (!loaded) return;
    if (DEBUG_BYPASS_AUTH) return; // Bỏ qua nếu đang bật bypass

    // Ép kiểu any để tránh lỗi TypeScript gán literal 'never'
    const currentSegments = segments as any[];
    const inAuthGroup = currentSegments.includes("(auth)");
    const inTabsGroup = currentSegments.includes("(tabs)");

    console.log("[ROUTING] Segments:", currentSegments, "| Token exists:", !!currentToken);

    if (!currentToken && !inAuthGroup) {
      console.log("[ROUTING] Redirecting to Login...");
      router.replace("/(auth)/login");
    } else if (currentToken && (inAuthGroup || currentSegments.length === 0 || (!inAuthGroup && !inTabsGroup))) {
      console.log("[ROUTING] Redirecting to Dashboard...");
      router.replace("/(tabs)");
    }
  }, [currentToken, segments, loaded, DEBUG_BYPASS_AUTH]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? AtelierDarkTheme : AtelierLightTheme}
        >
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="+not-found"
              options={{ title: "Not Found" }}
            />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
