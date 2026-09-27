import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface ForecastCardProps {
  day: string;
  condition: 'sun' | 'rain' | 'storm' | 'cloud' | 'wind';
  tempHigh: number;
  tempLow: number;
  precipitation: number;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  day,
  condition,
  tempHigh,
  tempLow,
  precipitation,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.day}>{day}</Text>
      <WeatherIcon name={condition} size={28} color={Colors.accent.cyan} />
      <View style={styles.temps}>
        <Text style={styles.high}>{tempHigh}°</Text>
        <Text style={styles.low}>{tempLow}°</Text>
      </View>
      <View style={styles.precip}>
        <WeatherIcon name="rain" size={10} color={Colors.text.tertiary} />
        <Text style={styles.precipText}>{precipitation}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.bg.glassBorder,
    padding: Spacing.md,
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 80,
  },
  day: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  temps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  high: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  low: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
  },
  precip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  precipText: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
  },
});
