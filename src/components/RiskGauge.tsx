import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SeverityBand } from '../state/useRiskStore';
import { Colors, FontSize } from '../theme/colors';

interface RiskGaugeProps {
  score: number;
  severity: SeverityBand;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, severity, size = 180 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (band: SeverityBand) => {
    switch (band) {
      case 'CRITICAL': return Colors.severity.critical.accent;
      case 'HIGH': return Colors.severity.high.accent;
      case 'MODERATE': return Colors.severity.moderate.accent;
      default: return Colors.severity.low.accent;
    }
  };

  const gaugeColor = getColor(severity);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          stroke={Colors.bg.glass}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Gauge fill */}
        <Circle
          stroke={gaugeColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
        {/* Glow effect ring */}
        <Circle
          stroke={gaugeColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth + 8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          opacity={0.15}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.scoreText, { color: gaugeColor }]}>{score}</Text>
        <Text style={styles.subText}>INDEX / 100</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text.tertiary,
    marginTop: -2,
    letterSpacing: 0.5,
  },
});