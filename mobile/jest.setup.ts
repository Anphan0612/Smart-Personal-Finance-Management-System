import '@testing-library/jest-native/extend-expect';

// Avoid Expo winter lazy getter pulling runtime imports during Jest teardown.
(globalThis as any).__ExpoImportMetaRegistry = {};

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Error: 'Error', Success: 'Success' },
}));

