import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useRiskStore } from '../../state/useRiskStore';
import { evacuationService } from '../../services/evacuation/evacuationService';
import { RiskGauge } from '../../components/RiskGauge';
import { RiskBadge } from '../../components/RiskBadge';
import { GlassCard } from '../../components/GlassCard';
import { WeatherIcon } from '../../components/WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

const SEVERITY_ICON: Record<string, 'sun' | 'wind' | 'storm' | 'alert'> = {
  LOW: 'sun',
  MODERATE: 'wind',
  HIGH: 'alert',
  CRITICAL: 'storm',
};

export const RiskScoreScreen: React.FC = () => {
  const { currentRisk, activeDistrict, activeState, isLiveGpsMode, userLocation } = useRiskStore();

  if (!currentRisk) {
    return (
      <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
        <View style={styles.centerContainer}>
          <WeatherIcon name="cloud" size={40} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>Telemetry data loading or unavailable.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Location Header */}
        <View style={styles.locationBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <WeatherIcon name="map" size={16} color={Colors.accent.cyan} />
            <Text style={styles.locationBannerText} numberOfLines={1}>
              {isLiveGpsMode
                ? userLocation?.formattedAddress || `${activeDistrict}, ${activeState}`
                : `${activeDistrict}, ${activeState}`}
            </Text>
          </View>
          <View style={[styles.modeBadge, { backgroundColor: isLiveGpsMode && userLocation?.isLiveGps && !userLocation.isApproximate ? '#DCFCE7' : '#EFF6FF' }]}>
            <Text style={[styles.modeBadgeText, { color: isLiveGpsMode && userLocation?.isLiveGps && !userLocation.isApproximate ? '#16A34A' : '#1D4ED8' }]}>
              {isLiveGpsMode ? (userLocation?.isApproximate ? 'APPROXIMATE LOCATION' : 'DEVICE LOCATION') : 'SELECTED LOCATION'}
            </Text>
          </View>
        </View>

        {/* Gauge & Top Rating */}
        <View style={styles.gaugeContainer}>
          <RiskGauge score={currentRisk.compositeScore} severity={currentRisk.severityLabel} size={180} />
          <View style={styles.badgeWrapper}>
            <RiskBadge severity={currentRisk.severityLabel} size="large" />
          </View>
          {currentRisk.severityLabel !== 'UNKNOWN' && (
            <Text style={styles.leadActionText}>
              App-only precipitation threshold · not a certified flood or landslide risk score
            </Text>
          )}
        </View>

        <GlassCard style={styles.leadCard}>
          <View style={styles.cardTitleRow}>
            <WeatherIcon name="alert" size={18} color={Colors.severity.critical.accent} />
            <Text style={styles.cardHeader}>Lead-time forecast unavailable</Text>
          </View>
          <Text style={styles.leadActionText}>
            This prototype has no authorized, validated river-gauge and catchment forecast feed. It cannot predict time to a flood crest or recommend a safe evacuation route.
          </Text>
          <TouchableOpacity
            style={styles.shelterBtn}
            onPress={() => evacuationService.navigateToSafeShelter(
              userLocation?.isApproximate ? undefined : userLocation?.latitude,
              userLocation?.isApproximate ? undefined : userLocation?.longitude
            )}
          >
            <WeatherIcon name="compass" size={16} color="#FFFFFF" />
            <Text style={styles.shelterBtnText}>Search nearby map places</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Weather observations only; not an authority warning */}
        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <WeatherIcon name="cloud" size={18} color={Colors.accent.cyan} />
            <Text style={styles.cardHeader}>Weather signal · not an official warning</Text>
          </View>
          {currentRisk.factors.length === 0 && (
            <Text style={styles.leadActionText}>No live weather observations are available for risk scoring.</Text>
          )}
          {currentRisk.factors.map((factor) => {
            const icon = SEVERITY_ICON[factor.severity] || 'cloud';
            return (
              <View key={factor.name} style={styles.factorItem}>
                <View style={styles.factorLeft}>
                  <View style={styles.factorIcon}>
                    <WeatherIcon
                      name={icon}
                      size={14}
                      color={Colors.severity[factor.severity.toLowerCase() as keyof typeof Colors.severity]?.text || Colors.text.secondary}
                    />
                  </View>
                  <View>
                    <Text style={styles.factorLabel}>{factor.name}</Text>
                    <Text style={styles.factorBadge}>{factor.sourceBadge}</Text>
                    <Text style={styles.factorValue}>
                      {factor.value} {factor.unit}
                    </Text>
                  </View>
                </View>
                <RiskBadge severity={factor.severity} size="small" />
              </View>
            );
          })}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <WeatherIcon name="settings" size={18} color={Colors.accent.amber} />
            <Text style={styles.cardHeader}>Official data connections</Text>
          </View>
          <Text style={styles.leadActionText}>
            CWC river gauges, IMD station/radar observations, GSI landslide monitoring, NHAI road telemetry, and authority-verified shelter data are not connected. Their readings are not estimated or shown as safe.
          </Text>
          <Text style={styles.leadActionText}>
            {currentRisk.severityLabel === 'UNKNOWN'
              ? 'Current risk status: unavailable. No live weather observation was received.'
              : 'The displayed precipitation thresholds are a non-authoritative weather signal only; this is not a flood-risk forecast.'}
          </Text>
        </GlassCard>

        {/* AI & NCMRWF Explanation */}
        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <WeatherIcon name="storm" size={18} color={Colors.accent.amber} />
            <Text style={styles.cardHeader}>Data status</Text>
          </View>
          {currentRisk.explanation.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </GlassCard>


      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: { color: Colors.text.tertiary, fontSize: FontSize.md },

  gaugeContainer: { marginVertical: Spacing.lg, alignItems: 'center' },
  badgeWrapper: { marginTop: Spacing.sm },

  leadCard: {
    width: '100%',
    marginBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderColor: Colors.severity.critical.accent,
    borderWidth: 1.5,
  },
  leadBox: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xs,
  },
  leadHighlight: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.severity.critical.text,
  },
  leadSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  leadActionText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginVertical: Spacing.xs,
    lineHeight: 18,
  },
  shelterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.cyan,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
    marginTop: Spacing.xs,
  },
  shelterBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '800',
  },

  card: {
    width: '100%',
    marginBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.text.primary,
    textTransform: 'uppercase',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accent.cyan,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  factorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  factorBadge: {
    fontSize: 9,
    color: Colors.accent.cyanDark,
    fontWeight: '600',
  },
  factorValue: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: '800',
    marginTop: 1,
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  metricLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  metricVal: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationBannerText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  agencyCard: {
    width: '100%',
    marginBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    padding: Spacing.md,
  },
  agencyHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  agencyLogosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  agencyItem: {
    alignItems: 'center',
    gap: 4,
  },
  agencyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text.primary,
  },
});