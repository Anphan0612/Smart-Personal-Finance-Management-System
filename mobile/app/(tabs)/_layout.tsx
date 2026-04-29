import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BarChart3, PiggyBank, Receipt, User, Plus } from 'lucide-react-native';
import { AtelierAI } from '../../src/components/ui/AtelierAI';
import { ActionHub } from '../../src/components/ui/ActionHub';
import { TopBar } from '../../src/components/atelier/TopBar';
import { useAppStore } from '../../src/store/useAppStore';
import { MotiView } from 'moti';
import { Colors } from '../../src/constants/tokens';
import { AtelierTokens } from '../../src/constants/AtelierTokens';

import { ManualTransactionModal } from '../../src/features/transactions/ManualTransactionModal';

export default function TabLayout() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isActionHubOpen, setIsActionHubOpen] = useState(false);
  const { user, isTransactionModalOpen, setTransactionModalOpen } = useAppStore();
  const insets = useSafeAreaInsets();

  // Dynamic values
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;
  const tabBarHeight = 64 + bottomPadding;

  return (
    <View style={[styles.root, { backgroundColor: Colors.surface.containerLowest }]}>
      {/* 1. Atelier TopBar */}
      <TopBar title={user?.name || 'Atelier Finance'} />

      {/* 2. Main Navigation */}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.primary.DEFAULT,
            tabBarInactiveTintColor: Colors.neutral[400],
            headerShown: false,
            tabBarStyle: {
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderTopWidth: 1,
              borderTopColor: Colors.neutral[100],
              elevation: 0,
              height: tabBarHeight,
              paddingBottom: bottomPadding,
              paddingTop: 12,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: Colors.neutral[900],
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
            },
            tabBarLabelStyle: {
              fontFamily: 'Inter_600SemiBold',
              fontSize: 10,
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              tabBarIcon: ({ color, focused }) => (
                <BarChart3 size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="budget"
            options={{
              title: 'Saving',
              tabBarIcon: ({ color, focused }) => (
                <PiggyBank size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: 'History',
              tabBarIcon: ({ color, focused }) => (
                <Receipt size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              ),
            }}
          />
        </Tabs>
      </View>

      {/* 3. Action Hub FAB */}
      {!isActionHubOpen && (
        <ActionHubFAB offset={tabBarHeight + 20} onPress={() => setIsActionHubOpen(true)} />
      )}

      {/* 4. Action Hub Bottom Sheet */}
      <ActionHub
        isOpen={isActionHubOpen}
        onClose={() => setIsActionHubOpen(false)}
        onAddTransaction={() => {
          setIsActionHubOpen(false);
          setTransactionModalOpen(true);
        }}
        onAskAI={() => setIsAIOpen(true)}
        tabBarHeight={tabBarHeight}
      />

      {/* 5. Global AI Assistant Drawer */}
      <AtelierAI isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* 6. Global Manual Transaction Modal */}
      <ManualTransactionModal
        isVisible={isTransactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
      />
    </View>
  );
}

const ActionHubFAB = ({ onPress, offset }: { onPress: () => void; offset: number }) => {
  return (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 1000 }}
      style={[styles.fabContainer, { bottom: offset }]}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ loop: true, duration: 2500, type: 'timing' }}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
          style={[
            styles.fabButton,
            { backgroundColor: Colors.primary.DEFAULT, shadowColor: Colors.primary.DEFAULT },
          ]}
        >
          <Plus color="white" size={28} strokeWidth={2.5} />
        </TouchableOpacity>
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    zIndex: 90,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
});
