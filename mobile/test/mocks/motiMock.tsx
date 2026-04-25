import React from 'react';
import { View } from 'react-native';

export const MotiView = ({ children, ...props }: any) => <View {...props}>{children}</View>;

export const AnimatePresence = ({ children }: any) => <>{children}</>;
