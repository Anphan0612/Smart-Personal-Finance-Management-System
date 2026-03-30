export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const theme = {
  colors: {
    background: '#f6fafe',
    surfaceContainerLow: '#f0f4f8',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerHigh: '#e4e9ed',
    primary: '#003d9b',
    primaryContainer: '#0052cc',
    onSurface: '#171c1f',
    onSurfaceVariant: '#434654',
    secondaryContainer: '#6cf8bb',
    tertiaryContainer: '#a62859',
    secondaryFixed: '#6ffbbe',
    outlineVariant: 'rgba(195, 198, 214, 0.2)',
  },
  typography: {
    display: {
      fontFamily: 'System', // Would be Manrope
      fontWeight: 'bold' as const,
    },
    body: {
      fontFamily: 'System', // Would be Inter
    }
  },
  shadows: {
    ambient: {
      shadowColor: '#171c1f',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.06,
      shadowRadius: 40,
      elevation: 2,
    }
  },
  roundness: {
    md: 12,
    full: 9999,
  }
};
