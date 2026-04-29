import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

interface AIChatButtonProps {
  onPress: () => void;
}

export const AIChatButton = ({ onPress }: AIChatButtonProps) => {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ loop: true, duration: 2000, type: 'timing' }}
      >
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.buttonShadow}>
          <LinearGradient colors={['#005ab4', '#0873df']} style={styles.button}>
            <Sparkles size={24} color="white" fill="white" />
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120, // Move up a bit to be safe
    right: 30,
    zIndex: 9999, // Extremely high z-index
    elevation: 20, // Elevation for Android
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
