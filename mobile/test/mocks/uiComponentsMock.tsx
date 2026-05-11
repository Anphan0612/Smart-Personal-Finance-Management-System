import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export const AtelierTypography = ({ children, ...props }: any) =>
  React.createElement(Text, props, children);

export const AtelierInput = ({ testID, value, onChangeText, placeholder, error, ...props }: any) =>
  React.createElement(
    View,
    null,
    React.createElement(TextInput, { testID, value, onChangeText, placeholder, ...props }),
    error ? React.createElement(Text, null, error) : null,
  );

export const AtelierButton = ({ testID, label, onPress }: any) =>
  React.createElement(
    TouchableOpacity,
    { testID, onPress },
    React.createElement(Text, null, label),
  );

export const SkeletonBox = ({ children }: any) => React.createElement(View, null, children);
