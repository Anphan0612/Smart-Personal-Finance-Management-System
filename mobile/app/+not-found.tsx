import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { AtelierTypography, AtelierButton } from '../src/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark p-6">
        <AtelierTypography variant="h2" className="text-neutral-900 dark:text-neutral-50">
          Page not found
        </AtelierTypography>
        <AtelierTypography variant="body" className="text-neutral-400 mt-2 text-center">
          The screen you're looking for doesn't exist.
        </AtelierTypography>
        <View className="mt-6">
          <Link href="/" asChild>
            <AtelierButton variant="primary" label="Go to Home" />
          </Link>
        </View>
      </View>
    </>
  );
}
