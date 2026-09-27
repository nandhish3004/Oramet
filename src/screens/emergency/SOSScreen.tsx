import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '../../services/api/apiClient';
import { smsService } from '../../services/sms/smsService';
import { evacuationService, DESIGNATED_SHELTERS, SafeShelter } from '../../services/evacuation/evacuationService';
import { shakeService } from '../../services/emergency/shakeService';
import { useAuthStore } from '../../state/useAuthStore';
import { useRiskStore } from '../../state/useRiskStore';
import { WeatherIcon } from '../../components/WeatherIcon';
import { GlassCard } from '../../components/GlassCard';
import { RescueWhistleModal } from '../../components/RescueWhistleModal';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';

export const SOSScreen: React.FC = () => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [whistleVisible, setWhistleVisible] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const user = useAuthStore((state) => state.user);
  const isConnected = useRiskStore((state) => state.isConnected);
  const userLoc = useRiskStore((state) => state.userLocation);
  const isLiveGpsMode = useRiskStore((state) => state.isLiveGpsMode);

  const shelters =
    isLiveGpsMode && userLoc
      ? evacuationService.getDynamicNearbyShelters(userLoc.latitude, userLoc.longitude, userLoc.city)
      : DESIGNATED_SHELTERS;

  const triggerSOS = () => {
    Alert.alert(
      'Confirm Emergency Broadcast',
      'This action will transmit your precise GPS coordinates to NDRF rescue teams and dispatch an emergency SMS to 112.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'SEND SOS NOW', style: 'destructive', onPress: executeEmergencySequence },
      ]
    );
  };

  const executeEmergencySequence = () => {
    setIsDispatching(true);

    const storeLoc = useRiskStore.getState().userLocation;
    const defaultLat = storeLoc?.latitude ?? 28.6139;
    const defaultLng = storeLoc?.longitude ?? 77.2090;

    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fallbackToSMS(latitude, longitude);
      },
      async () => {
        await fallbackToSMS(defaultLat, defaultLng);
      },
      { enableHighAccuracy: true, timeout: 2500, maximumAge: 5000 }
    );
  };

  const fallbackToSMS = async (lat: number, lng: number) => {
    const sent = await smsService.sendEmergencySMS({ latitude: lat, longitude: lng });
    setIsDispatching(false);
    if (!sent) {
      Alert.alert(
        'Manual Action Required',
        'Could not initialize SMS dispatcher. Dial 112 or contact local rescue services directly.'
      );
    }
  };

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <WeatherIcon name="sos" size={26} color={Colors.severity.critical.accent} />
          <View>
            <Text style={styles.headerTitle}>Emergency SOS</Text>
            <Text style={styles.headerSub}>Immediate Rescue & Family Alert</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Dispatches your exact GPS coordinates and Google Maps pin to national emergency services (112) and your saved emergency contacts via SMS.
        </Text>

        {/* Connection & Shake Status */}
        <View style={styles.statusGrid}>
          <GlassCard style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? Colors.status.online : Colors.status.offline }]} />
              <Text style={styles.statusText}>
                {isConnected ? 'Online: Dual API + SMS' : 'Offline: SMS 112 Fallback Ready'}
              </Text>
            </View>
          </GlassCard>

          <TouchableOpacity
            style={[styles.shakeToggle, shakeEnabled && styles.shakeToggleActive]}
            onPress={() => {
              setShakeEnabled(!shakeEnabled);
              if (!shakeEnabled) shakeService.startListening();
              else shakeService.stopListening();
            }}
          >
            <WeatherIcon name="alert" size={14} color={shakeEnabled ? Colors.accent.cyan : Colors.text.muted} />
            <Text style={[styles.shakeText, shakeEnabled && styles.shakeTextActive]}>
              {shakeEnabled ? 'Shake-to-SOS Active' : 'Shake-to-SOS Off'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Big SOS Button */}
        <View style={styles.sosContainer}>
          <View style={styles.sosOuter}>
            <View style={styles.sosPulseRing} />
            <TouchableOpacity
              style={[styles.sosButton, isDispatching && styles.sosButtonDisabled]}
              onPress={triggerSOS}
              disabled={isDispatching}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDispatching ? ['#991B1B', '#7F1D1D'] : ['#EF4444', '#DC2626', '#B91C1C']}
                style={styles.sosGradient}
              >
                <Text style={styles.sosButtonText}>
                  {isDispatching ? 'TRANSMITTING' : 'SOS'}
                </Text>
                {!isDispatching && (
                  <Text style={styles.sosSub}>Tap to Broadcast</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Siren Trigger */}
        <TouchableOpacity style={styles.whistleBanner} onPress={() => setWhistleVisible(true)}>
          <WeatherIcon name="whistle" size={20} color={Colors.severity.critical.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.whistleTitle}>Emergency Siren & SOS Vibration</Text>
            <Text style={styles.whistleSub}>Vibrates phone in SOS pattern to alert nearby rescuers</Text>
          </View>
          <WeatherIcon name="arrow-right" size={16} color={Colors.text.tertiary} />
        </TouchableOpacity>

        {/* Safe High Ground Evacuation Shelters */}
        <Text style={styles.shelterSectionTitle}>
          {isLiveGpsMode && userLoc
            ? `Designated Safe Shelters near ${userLoc.city}`
            : 'Designated High-Ground Safe Shelters'}
        </Text>
        <Text style={styles.shelterSectionSub}>Tap any shelter to open direct walking routes avoiding flooded roads:</Text>
        {shelters.map((shelter: SafeShelter) => (
          <GlassCard key={shelter.id} style={styles.shelterCard}>
            <View style={styles.shelterTop}>
              <View style={styles.shelterInfo}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                <Text style={styles.shelterElevation}>Elevation: {shelter.elevationMeters}m (Safe Ridge)</Text>
              </View>
              <View style={styles.capacityBadge}>
                <Text style={styles.capacityText}>{shelter.capacity} Cap</Text>
              </View>
            </View>

            <View style={styles.facilitiesRow}>
              {shelter.facilities.map((fac) => (
                <View key={fac} style={styles.facilityPill}>
                  <Text style={styles.facilityText}>{fac}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={() => evacuationService.navigateToSafeShelter(userLoc?.latitude, userLoc?.longitude, shelter)}
            >
              <WeatherIcon name="compass" size={16} color="#FFFFFF" />
              <Text style={styles.navigateBtnText}>Navigate via Google Maps</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}

        {/* Emergency Numbers Card */}
        <GlassCard style={styles.numbersCard}>
          <Text style={styles.numbersTitle}>OFFICIAL DISASTER HELPLINES</Text>
          <View style={styles.numberRow}>
            <Text style={styles.numberLabel}>National Emergency Dispatch</Text>
            <Text style={styles.numberValue}>112</Text>
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.numberLabel}>NDRF Control Room</Text>
            <Text style={styles.numberValue}>011-24363260</Text>
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.numberLabel}>State Disaster Management (SDMA)</Text>
            <Text style={styles.numberValue}>1070 / 1077</Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Acoustic Rescue Siren Modal */}
      <RescueWhistleModal visible={whistleVisible} onClose={() => setWhistleVisible(false)} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.text.primary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginVertical: Spacing.sm,
  },

  statusGrid: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  shakeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.xs,
  },
  shakeToggleActive: {
    borderColor: Colors.accent.cyan,
    backgroundColor: '#F0F9FF',
  },
  shakeText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  shakeTextActive: {
    color: Colors.accent.cyanDark,
    fontWeight: '700',
  },

  sosContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  sosOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosPulseRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  sosGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonDisabled: { opacity: 0.7 },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sosSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },

  whistleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  whistleTitle: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.severity.critical.text,
  },
  whistleSub: {
    fontSize: 10,
    color: Colors.text.secondary,
  },

  shelterSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shelterSectionSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    marginTop: 2,
  },
  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  shelterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  shelterInfo: { flex: 1 },
  shelterName: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  shelterElevation: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  capacityBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  capacityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: Spacing.xs,
  },
  facilityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  facilityText: {
    fontSize: 9,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.cyan,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
    marginTop: Spacing.xs,
  },
  navigateBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '800',
  },

  numbersCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    marginTop: Spacing.md,
  },
  numbersTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  numberLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  numberValue: {
    fontSize: FontSize.xs,
    color: Colors.severity.critical.text,
    fontWeight: '800',
  },
});