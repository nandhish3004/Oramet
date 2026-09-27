import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

interface AlertCardProps {
  id: string;
  severity: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  onPress: () => void;
}

const SEVERITY_CONFIG: Record<string, { color: string; icon: 'storm' | 'alert' | 'wind' | 'sun' }> = {
  CRITICAL: { color: Colors.severity.critical.text, icon: 'storm' },
  HIGH: { color: Colors.severity.high.text, icon: 'alert' },
  MODERATE: { color: Colors.severity.moderate.text, icon: 'wind' },
  LOW: { color: Colors.severity.low.text, icon: 'sun' },
};

export const AlertCard: React.FC<AlertCardProps> = ({
  severity,
  title,
  description,
  createdAt,
  isRead,
  onPress,
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;

  const timeAgo = (() => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  })();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard
        style={!isRead ? { ...styles.card, borderLeftColor: config.color, borderLeftWidth: 3 } : styles.card}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
            <WeatherIcon name={config.icon} size={18} color={config.color} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {!isRead && <View style={[styles.unreadDot, { backgroundColor: config.color }]} />}
            </View>
            <View style={styles.meta}>
              <View style={[styles.severityBadge, { backgroundColor: `${config.color}20` }]}>
                <Text style={[styles.severityText, { color: config.color }]}>{severity}</Text>
              </View>
              <Text style={styles.time}>{timeAgo}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  severityText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
