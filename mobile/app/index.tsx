import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  const currentToken = useAppStore((state: any) => state.token);
  const [isHydrated, setIsHydrated] = useState(false);

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

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (currentToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
