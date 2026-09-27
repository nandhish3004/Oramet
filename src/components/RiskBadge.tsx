import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeverityBand } from '../state/useRiskStore';
import { Colors, FontSize } from '../theme/colors';

interface RiskBadgeProps {
  severity: SeverityBand;
  size?: 'small' | 'medium' | 'large';
}

const SEVERITY_STYLES: Record<SeverityBand, { bg: string; text: string }> = {
  LOW: { bg: Colors.severity.low.bg, text: Colors.severity.low.text },
  MODERATE: { bg: Colors.severity.moderate.bg, text: Colors.severity.moderate.text },
  HIGH: { bg: Colors.severity.high.bg, text: Colors.severity.high.text },
  CRITICAL: { bg: Colors.severity.critical.bg, text: Colors.severity.critical.text },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, size = 'medium' }) => {
  const config = SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, styles[size]]}>
      <Text style={[styles.text, { color: config.text }, styles[`${size}Text`]]}>
        {severity} RISK
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  small: { paddingHorizontal: 6, paddingVertical: 2 },
  medium: { paddingHorizontal: 10, paddingVertical: 4 },
  large: { paddingHorizontal: 14, paddingVertical: 6 },
  text: { fontWeight: '800', letterSpacing: 0.5 },
  smallText: { fontSize: FontSize.xs },
  mediumText: { fontSize: FontSize.sm },
  largeText: { fontSize: FontSize.md },
});