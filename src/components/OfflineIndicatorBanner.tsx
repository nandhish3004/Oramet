import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { networkResilienceService, NetworkTier } from '../services/network/NetworkResilienceService';
import { WeatherIcon } from './WeatherIcon';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme/colors';

export const OfflineIndicatorBanner: React.FC = () => {
  const [networkTier, setNetworkTier] = useState<NetworkTier>(
    networkResilienceService.getNetworkTier()
  );
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = networkResilienceService.subscribe((tier) => {
      setNetworkTier(tier);
      if (tier !== 'STABLE_BROADBAND') {
        setIsDismissed(false);
      }
    });
    return unsubscribe;
  }, []);

  if (networkTier === 'STABLE_BROADBAND' || isDismissed) {
    return null;
  }

  const isOffline = networkTier === 'OFFLINE';

  return (
    <View
      style={[
        styles.banner,
        isOffline ? styles.bannerOffline : styles.bannerLowBandwidth,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <WeatherIcon
            name={isOffline ? 'whistle' : 'compass'}
            size={14}
            color={isOffline ? '#BA1A1A' : '#845300'}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, isOffline ? styles.titleOffline : styles.titleLowBandwidth]}>
            {isOffline ? 'OFFLINE MODE ACTIVE' : 'LOW BANDWIDTH DETECTED'}
          </Text>
          <Text style={styles.subtitle}>
            {isOffline
              ? 'No internet connection. Emergency 112 SMS and cached safety guidelines remain ready.'
              : 'Low network speed. Essential weather alerts and emergency features are prioritized.'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setIsDismissed(true)}
        accessibilityLabel="Dismiss Offline Banner"
      >
        <WeatherIcon name="check" size={14} color="#727785" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  bannerOffline: {
    backgroundColor: '#FFDAD6',
    borderColor: 'rgba(186, 26, 26, 0.3)',
  },
  bannerLowBandwidth: {
    backgroundColor: '#FFDDB8',
    borderColor: 'rgba(132, 83, 0, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleOffline: {
    color: '#BA1A1A',
  },
  titleLowBandwidth: {
    color: '#653E00',
  },
  subtitle: {
    fontSize: 9,
    color: '#414754',
    marginTop: 1,
    lineHeight: 12,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
});
