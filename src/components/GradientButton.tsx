import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, FontSize, Spacing } from '../theme/colors';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'warm' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const GRADIENT_MAP = {
  primary: Colors.gradient.accent,
  danger: Colors.gradient.danger,
  warm: Colors.gradient.warm,
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  size = 'medium',
}) => {
  const isOutline = variant === 'outline';
  const sizeStyle = styles[size];

  if (isOutline) {
    return (
      <TouchableOpacity
        style={[styles.outlineButton, sizeStyle, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={Colors.accent.cyan} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.outlineText, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={GRADIENT_MAP[variant] || GRADIENT_MAP.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, sizeStyle]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  medium: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.accent.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineText: {
    color: Colors.accent.cyan,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
