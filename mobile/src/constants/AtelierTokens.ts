/**
 * Atelier Design System Tokens
 * Editorial Fintech Design Language
 */

export const AtelierTokens = {
  // Radius System
  radius: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    full: 40,
  },

  // Spacing System
  spacing: {
    container: 24,
    stack: 12,
    inline: 8,
    section: 32,
    card: 16,
  },

  // Elevation & Tonal Shades
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 10,
    },
  },

  // Typography Scale
  typography: {
    displayLarge: {
      fontSize: 57,
      lineHeight: 64,
      fontFamily: 'Inter_700Bold',
      letterSpacing: -0.25,
    },
    displayMedium: {
      fontSize: 45,
      lineHeight: 52,
      fontFamily: 'Inter_700Bold',
      letterSpacing: 0,
    },
    displaySmall: {
      fontSize: 36,
      lineHeight: 44,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0,
    },
    headlineLarge: {
      fontSize: 32,
      lineHeight: 40,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0,
    },
    headlineMedium: {
      fontSize: 28,
      lineHeight: 36,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0,
    },
    headlineSmall: {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0,
    },
    titleLarge: {
      fontSize: 22,
      lineHeight: 28,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0,
    },
    titleMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.4,
    },
    labelLarge: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter_500Medium',
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Inter_500Medium',
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontSize: 11,
      lineHeight: 16,
      fontFamily: 'Inter_500Medium',
      letterSpacing: 0.5,
    },
  },

  // Animation Durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

export type AtelierTokensType = typeof AtelierTokens;
