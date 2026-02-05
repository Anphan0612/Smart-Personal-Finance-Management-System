import { Colors, Spacing, BorderRadius } from './colors';

export const Theme = {
    colors: Colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    text: {
        fontFamily: {
            regular: 'System', // Replace with custom font if loaded
            medium: 'System',
            bold: 'System',
        },
        size: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 20,
            xl: 24,
            xxl: 32,
        },
        weight: {
            regular: '400',
            medium: '500',
            bold: '700',
        },
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            elevation: 1,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
    },
};
