import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface QuickActionTileProps {
  icon: 'shield' | 'alert' | 'map' | 'sos' | 'bell' | 'settings' | 'storm' | 'flood' | 'camera' | 'whistle' | 'compass';
  label: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
}

export const QuickActionTile: React.FC<QuickActionTileProps> = ({
  icon,
  label,
  subtitle,
  color = Colors.accent.cyan,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
        <WeatherIcon name={icon} size={22} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '47%',
    backgroundColor: Colors.bg.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.bg.glassBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
});
