import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAlertStore } from '../../state/useAlertStore';
import { GlassCard } from '../../components/GlassCard';
import { WeatherIcon } from '../../components/WeatherIcon';
import { GradientButton } from '../../components/GradientButton';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

const SEVERITY_CONFIG: Record<string, { color: string; bgColor: string; icon: 'storm' | 'alert' | 'wind' | 'sun' }> = {
  CRITICAL: { color: Colors.severity.critical.text, bgColor: Colors.severity.critical.bg, icon: 'storm' },
  HIGH: { color: Colors.severity.high.text, bgColor: Colors.severity.high.bg, icon: 'alert' },
  MODERATE: { color: Colors.severity.moderate.text, bgColor: Colors.severity.moderate.bg, icon: 'wind' },
  LOW: { color: Colors.severity.low.text, bgColor: Colors.severity.low.bg, icon: 'sun' },
};

export const AlertDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { alerts, markRead } = useAlertStore();
  const alertId = route.params?.alertId;
  const alert = alerts.find((a) => a.id === alertId);

  useEffect(() => {
    if (alert && alert.is_read === 0) {
      markRead(alert.id);
    }
  }, [alertId]);

  if (!alert) {
    return (
      <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Alert not found</Text>
        </View>
      </LinearGradient>
    );
  }

  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Severity Banner */}
        <View style={[styles.banner, { backgroundColor: config.bgColor }]}>
          <View style={styles.bannerInner}>
            <View style={[styles.iconCircle, { backgroundColor: `${config.color}30` }]}>
              <WeatherIcon name={config.icon} size={32} color={config.color} />
            </View>
            <View style={[styles.severityPill, { backgroundColor: `${config.color}30` }]}>
              <Text style={[styles.severityText, { color: config.color }]}>
                {alert.severity} SEVERITY
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.time}>
          Issued: {new Date(alert.created_at).toLocaleString()}
        </Text>

        {/* Description Card */}
        <GlassCard style={styles.descCard}>
          <Text style={styles.descLabel}>ALERT DETAILS</Text>
          <Text style={styles.description}>{alert.description}</Text>
        </GlassCard>

        {/* Recommended Actions */}
        <GlassCard style={styles.actionsCard}>
          <Text style={styles.descLabel}>RECOMMENDED ACTIONS</Text>
          <View style={styles.actionRow}>
            <WeatherIcon name="check" size={14} color={Colors.severity.low.text} />
            <Text style={styles.actionText}>Monitor official weather updates</Text>
          </View>
          <View style={styles.actionRow}>
            <WeatherIcon name="check" size={14} color={Colors.severity.low.text} />
            <Text style={styles.actionText}>Prepare emergency supplies and evacuation kit</Text>
          </View>
          <View style={styles.actionRow}>
            <WeatherIcon name="check" size={14} color={Colors.severity.low.text} />
            <Text style={styles.actionText}>Keep phone charged for SOS dispatch</Text>
          </View>
          {alert.severity === 'CRITICAL' && (
            <View style={styles.actionRow}>
              <WeatherIcon name="alert" size={14} color={Colors.severity.critical.text} />
              <Text style={[styles.actionText, { color: Colors.severity.critical.text }]}>
                Evacuate to designated safe zone immediately
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Emergency Button */}
        <GradientButton
          title="Emergency SOS"
          onPress={() => navigation.navigate('Emergency' as never)}
          variant="danger"
          size="large"
          style={styles.emergencyBtn}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: Colors.text.secondary, fontSize: FontSize.md },

  banner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  bannerInner: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  severityPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  severityText: {
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xxl,
  },

  descCard: {
    marginBottom: Spacing.lg,
  },
  descLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 24,
  },

  actionsCard: {
    marginBottom: Spacing.xxl,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  actionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  emergencyBtn: {
    marginBottom: Spacing.lg,
  },
});
