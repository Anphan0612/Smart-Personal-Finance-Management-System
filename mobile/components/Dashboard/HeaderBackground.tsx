import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const HeaderBackground = () => {
    return (
        <View style={styles.container}>
            <View style={styles.backgroundContainer}>
                <Svg
                    height="280"
                    width={width}
                    viewBox={`0 0 ${width} 280`}
                    preserveAspectRatio="none"
                    style={styles.svg}
                >
                    <Path
                        d={`M0 0 L${width} 0 L${width} 220 Q${width / 2} 290 0 220 Z`}
                        fill={Theme.colors.primary}
                    />
                    {/* Decorative circles (subtle) */}
                    <Path
                        d={`M-50 -50 A 150 150 0 0 1 200 -50`}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="40"
                        fill="none"
                    />
                </Svg>
            </View>

            <SafeAreaView style={styles.content}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Good afternoon,</Text>
                        <Text style={styles.name}>Enjelin Morgeana</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
        zIndex: 0,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    svg: {},
    content: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
    },
    greeting: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: Theme.text.size.sm,
        fontWeight: '500',
    },
    name: {
        color: '#fff',
        fontSize: Theme.text.size.lg,
        fontWeight: 'bold',
        marginTop: 4,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: Theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.warning,
        borderWidth: 1.5,
        borderColor: Theme.colors.primary
    }
});
