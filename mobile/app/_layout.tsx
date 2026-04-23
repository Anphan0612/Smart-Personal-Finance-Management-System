import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme, LogBox, View } from 'react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Ignore specific warning from third-party libraries
LogBox.ignoreLogs(['SafeAreaView has been deprecated and will be removed in a future release.']);
import 'react-native-reanimated';
import '../global.css';
import { useAppStore } from '../src/store/useAppStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Pressable, Text } from 'react-native';

export function ErrorBoundary(props: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
        ❌ App Crash Detected
      </Text>
      <Text style={{ fontSize: 14, color: '#333', marginBottom: 20, textAlign: 'center' }}>
        {props.error.message}
      </Text>
      <Pressable
        onPress={props.retry}
        style={{ backgroundColor: '#005ab4', padding: 15, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
      </Pressable>
    </View>
  );
}

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const AtelierLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#005ab4',
    background: '#f9f9ff',
    card: '#ffffff',
    text: '#181c22',
    border: '#c1c6d5',
    notification: '#ba1a1a',
  },
};

const AtelierDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4da1f2',
    background: '#121212',
    card: '#1e1e1e',
    text: '#f3f3f4',
    border: '#32343a',
    notification: '#ff8f1a',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const currentToken = useAppStore((state: any) => state.token);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration tracking with diagnostic logging
  useEffect(() => {
    const hydrated = useAppStore.persist.hasHydrated();
    if (hydrated) {
      setIsHydrated(true);
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return unsub;
    }
  }, []);

  // Đặt true để gỡ chặn route (bypass login) trong quá trình phát triển UI
  const DEBUG_BYPASS_AUTH = false;

  // Khởi tạo QueryClient với các cấu hình an toàn cho Finance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              if (error?.response?.status === 403 || error?.response?.status === 401) return false;
              return failureCount < 1;
            },
            staleTime: 1000 * 30,
          },
        },
      }),
  );

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
    if (error) {
      console.error('[FONT ERROR]', error);
    }
  }, [error]);

  const isReady = loaded && isHydrated;

  // Auth Guard Logic
  useEffect(() => {
    if (!isReady) return;

    // CRITICAL: Wait for navigation state to be ready
    if (!rootNavigationState?.key) return;

    const currentSegments = segments as string[];
    const inAuthGroup = currentSegments.includes('(auth)');

    // Tránh vòng lặp: Chỉ redirect nếu thực sự cần thiết
    if (!currentToken && !inAuthGroup) {
      console.log('[ROUTING] Unauthenticated -> Login');
      router.replace('/(auth)/login');
    } else if (currentToken && (inAuthGroup || currentSegments.length === 0)) {
      console.log('[ROUTING] Authenticated -> Tabs');
      router.replace('/(tabs)');
    }

    // Ẩn Splash Screen sau khi đã xác định được tuyến đường
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [currentToken, segments, isReady, rootNavigationState?.key]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={colorScheme === 'dark' ? AtelierDarkTheme : AtelierLightTheme}>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
                <Stack.Screen name="receipt" options={{ headerShown: false }} />
              </Stack>
            </ThemeProvider>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
