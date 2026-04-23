import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AtelierTypography } from '../ui/AtelierTypography';
import { Colors } from '@/constants/tokens';

interface TopBarProps {
  title?: string;
  profileImage?: string;
}

export const TopBar = ({
  title = 'Atelier Finance',
  profileImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX7U0v9VEamFl7IAliq--5kr3XtzS_sBA8vBqpGMVjkGCaOlxzdWb3OXNvmypp2-b7ln0-I1lyOOfj_WPIaaj_DMlVyNQTUOycvE-epNOq_txVR5tXe6QZp1oeYLsjp2dEBQNEgeVDjddzOK0kGScD5U4CGNQcOSHWDKBau7PKYDEvw8nD_5Wf0SJov-3KzvpFHSJZel4ZD1f49YyjU8X2_ylxnj4UmU99UoSXlQT4x6EIiNUE9tedaTjD37eqYyD7atK9cDCygypZ',
}: TopBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <MotiView
      from={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{ type: 'timing', duration: 800, delay: 200 }}
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[100],
        zIndex: 50,
      }}
      className="absolute top-0 left-0 right-0"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10">
          <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
        </View>
        <AtelierTypography variant="h3" className="text-primary">
          {title}
        </AtelierTypography>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        className="w-10 h-10 items-center justify-center rounded-full bg-neutral-50"
      >
        <Bell size={24} color={Colors.primary.DEFAULT} strokeWidth={2} />
      </TouchableOpacity>
    </MotiView>
  );
};
