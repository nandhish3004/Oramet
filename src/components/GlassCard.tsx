import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  glowColor,
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        !noPadding && styles.padding,
        glowColor ? {
          borderColor: glowColor,
          shadowColor: glowColor,
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.glass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bg.glassBorder,
    ...Colors.shadow.card,
  },
  padding: {
    padding: Spacing.lg,
  },
});
