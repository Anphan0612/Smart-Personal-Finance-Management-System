module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|moti))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^moti$': '<rootDir>/test/mocks/motiMock.tsx',
    '^moti/(.*)$': '<rootDir>/test/mocks/motiMock.tsx',
    '^react-native-reanimated$': '<rootDir>/test/mocks/reanimatedMock.js',
    '^@gorhom/bottom-sheet$': '<rootDir>/test/mocks/bottomSheetMock.js',
    '^expo-linear-gradient$': '<rootDir>/test/mocks/linearGradientMock.js',
    '^lucide-react-native$': '<rootDir>/test/mocks/lucideMock.js',
    '^expo/src/winter(.*)$': '<rootDir>/test/mocks/expoWinterMock.js',
    '^@/components/ui$': '<rootDir>/test/mocks/uiComponentsMock.tsx',
    '^\.\./\.\./components/ui$': '<rootDir>/test/mocks/uiComponentsMock.tsx',
  },
};
