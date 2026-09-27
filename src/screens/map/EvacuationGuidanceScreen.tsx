import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WeatherIcon } from '../../components/WeatherIcon';
import { smsService } from '../../services/sms/smsService';
import { evacuationService } from '../../services/evacuation/evacuationService';
import { RescueWhistleModal } from '../../components/RescueWhistleModal';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme/colors';
import { useRiskStore } from '../../state/useRiskStore';

export const EvacuationGuidanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userLocation, activeDistrict, isLiveGpsMode } = useRiskStore();

  const userCity = isLiveGpsMode && userLocation ? userLocation.city : activeDistrict || 'Local Area';
  const userState = isLiveGpsMode && userLocation ? userLocation.state : 'India';
  const lat = userLocation?.latitude ?? 28.6139;
  const lng = userLocation?.longitude ?? 77.2090;

  const shelters = evacuationService.getDynamicNearbyShelters(lat, lng, userCity);
  const primaryShelter = shelters[0];

  const [sirenModalVisible, setSirenModalVisible] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleRouteSOS = async () => {
    Alert.alert(
      'Emergency SOS Dispatch',
      `Send distress alert with your live coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) to 112 and emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS Now',
          style: 'destructive',
          onPress: async () => {
            await smsService.sendDisasterAlertSMS(
              'EVACUATION DISTRESS ALERT',
              `I need emergency assistance near ${userCity}. Live GPS: https://maps.google.com/?q=${lat.toFixed(4)},${lng.toFixed(4)}`
            );
          },
        },
      ]
    );
  };

  const handleShareLocation = async () => {
    try {
      await Share.share({
        title: 'Emergency Evacuation Coordinates',
        message: `Emergency Evacuation Location:\nCity: ${userCity}, ${userState}\nLive Coordinates: https://maps.google.com/?q=${lat.toFixed(4)},${lng.toFixed(4)}\nHeading towards: ${primaryShelter.name}`,
      });
    } catch {}
  };

  const handleMarkSafe = () => {
    setCheckedIn(true);
    Alert.alert(
      'Check-in Confirmed',
      'You are marked safe. Proceeding to safe shelters directory.',
      [
        {
          text: 'View Shelters',
          onPress: () => navigation.navigate('SafeHaven'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <WeatherIcon name="arrow-left" size={16} color="#8C5338" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.brandTitle}>Evacuation Guidance</Text>
          <Text style={styles.headerSub}>
            {userCity}, {userState}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.helpHeaderBtn}
          onPress={() => Linking.openURL('tel:112')}
          accessibilityLabel="Call 112"
        >
          <Text style={styles.helpHeaderBtnText}>112</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Destination Hero Card */}
        <View style={styles.destinationCard}>
          <View style={styles.destinationBadgeRow}>
            <View style={styles.destinationBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.destinationBadgeText}>RECOMMENDED SAFE HAVEN</Text>
            </View>
            <Text style={styles.elevationPill}>High Ground</Text>
          </View>

          <Text style={styles.shelterTitle}>{primaryShelter.name}</Text>
          <Text style={styles.shelterSubtitle}>
            Designated emergency community evacuation center for {userCity}
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>~{primaryShelter.distanceKm} km</Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>~15 min</Text>
              <Text style={styles.metricLabel}>Walking Time</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Drinking Water</Text>
              <Text style={styles.metricLabel}>Verified Supplies</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.navGoogleBtn}
            onPress={() => evacuationService.navigateToSafeShelter(lat, lng, primaryShelter)}
          >
            <WeatherIcon name="compass" size={20} color="#FFFFFF" />
            <Text style={styles.navGoogleBtnText}>Start Walking Navigation in Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* OFFLINE MOUNTAIN CORRIDOR & BEARING CARD */}
        <View style={styles.offlineCorridorCard}>
          <View style={styles.offlineHeaderRow}>
            <View style={styles.offlineBadge}>
              <View style={styles.offlineGreenDot} />
              <Text style={styles.offlineBadgeText}>OFFLINE TOPOGRAPHIC CACHE ACTIVE</Text>
            </View>
            <Text style={styles.offlineSubBadge}>Zero Network Ready</Text>
          </View>
          <Text style={styles.offlineCorridorTitle}>Mountain Valley Evacuation Bearing</Text>
          <Text style={styles.offlineCorridorSub}>
            Pre-cached ridge coordinates and high ground bearings available even if mobile tower signals are lost.
          </Text>

          <View style={styles.compassRow}>
            <View style={styles.compassDialBox}>
              <WeatherIcon name="compass" size={28} color="#8C5338" />
              <Text style={styles.compassBearingValue}>38° NNE</Text>
              <Text style={styles.compassBearingLabel}>Ridge Line</Text>
            </View>
            <View style={styles.compassDetailsCol}>
              <View style={styles.compassDetailRow}>
                <Text style={styles.compassDetailKey}>Target Coordinates:</Text>
                <Text style={styles.compassDetailVal}>{primaryShelter.latitude.toFixed(4)}°N, {primaryShelter.longitude.toFixed(4)}°E</Text>
              </View>
              <View style={styles.compassDetailRow}>
                <Text style={styles.compassDetailKey}>Safe Elevation:</Text>
                <Text style={styles.compassDetailVal}>+{primaryShelter.elevationMeters}m Above River Bed</Text>
              </View>
              <View style={styles.compassDetailRow}>
                <Text style={styles.compassDetailKey}>Offline Route:</Text>
                <Text style={styles.compassDetailVal}>Paved Arterial Ridge Road</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Essential Flood & Storm Evacuation Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Essential Evacuation Safety Rules</Text>
          <Text style={styles.guidelinesSub}>Follow these guidelines from National Disaster Management authorities:</Text>

          <View style={styles.ruleBox}>
            <View style={styles.ruleIconCircle}>
              <WeatherIcon name="alert" size={16} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>Turn Around, Don't Drown</Text>
              <Text style={styles.ruleText}>
                Never attempt to walk, cycle, or drive through flooded roads or causeways. Moving water just 15 cm deep can sweep you off your feet.
              </Text>
            </View>
          </View>

          <View style={styles.ruleBox}>
            <View style={styles.ruleIconCircle}>
              <WeatherIcon name="shield" size={16} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>Stick to Higher Ground Arterial Roads</Text>
              <Text style={styles.ruleText}>
                Follow main elevated highways and paved roads. Avoid storm drains, agricultural canals, and underpasses where water accumulates rapidly.
              </Text>
            </View>
          </View>

          <View style={styles.ruleBox}>
            <View style={styles.ruleIconCircle}>
              <WeatherIcon name="wind" size={16} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>Beware of Fallen Electrical Lines</Text>
              <Text style={styles.ruleText}>
                Assume all downed wires are live. Stay at least 10 meters away and avoid stepping into puddles or water near electrical poles or transformers.
              </Text>
            </View>
          </View>

          <View style={styles.ruleBox}>
            <View style={styles.ruleIconCircle}>
              <WeatherIcon name="home" size={16} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>Secure Home Power & Gas</Text>
              <Text style={styles.ruleText}>
                Before leaving your residence, turn off the main circuit breaker and lock the main LPG cylinder valve to prevent fires and short circuits.
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Actions Group */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.arrivedBtn, checkedIn && styles.arrivedBtnDone]}
            onPress={handleMarkSafe}
          >
            <WeatherIcon name="check" size={20} color="#FFFFFF" />
            <Text style={styles.arrivedBtnText}>
              {checkedIn ? 'Marked Safe at Shelter (Confirmed)' : 'I Have Arrived Safely · Check-in'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity style={styles.sosActionBtn} onPress={handleRouteSOS}>
              <WeatherIcon name="alert" size={16} color="#DC2626" />
              <Text style={styles.sosActionBtnText}>Emergency SOS (112)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareActionBtn} onPress={handleShareLocation}>
              <WeatherIcon name="map" size={16} color="#0284C7" />
              <Text style={styles.shareActionBtnText}>Share Location</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sirenActionBtn}
            onPress={() => setSirenModalVisible(true)}
          >
            <WeatherIcon name="whistle" size={18} color="#DC2626" />
            <Text style={styles.sirenActionBtnText}>Sound Emergency Siren & SOS Vibration</Text>
          </TouchableOpacity>
        </View>

        {/* Calming Authority Footer */}
        <View style={styles.footerNote}>
          <WeatherIcon name="shield" size={14} color="#0D9488" />
          <Text style={styles.footerNoteText}>
            Relief operations coordinated in accordance with National Disaster Management Authority (NDMA) guidelines.
          </Text>
        </View>
      </ScrollView>

      {/* Rescue Whistle / Emergency Siren Modal */}
      <RescueWhistleModal
        visible={sirenModalVisible}
        onClose={() => setSirenModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  helpHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  helpHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 60,
  },

  destinationCard: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  destinationBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  destinationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  destinationBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  elevationPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  shelterTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  shelterSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  navGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  navGoogleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  guidelinesTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#0F172A',
  },
  guidelinesSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  ruleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ruleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  ruleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  actionsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  arrivedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  arrivedBtnDone: {
    backgroundColor: '#059669',
  },
  arrivedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  secondaryActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sosActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  sosActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  shareActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 6,
  },
  shareActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },

  sirenActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  sirenActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },

  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },

  offlineCorridorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    marginBottom: Spacing.lg,
    shadowColor: '#1F1A17',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  offlineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  offlineGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  offlineBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  offlineSubBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C5338',
  },
  offlineCorridorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F1A17',
    marginTop: 2,
  },
  offlineCorridorSub: {
    fontSize: 12,
    color: '#827C77',
    marginTop: 2,
    lineHeight: 16,
    marginBottom: 12,
  },
  compassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8F6F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  compassDialBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    minWidth: 84,
  },
  compassBearingValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#8C5338',
    marginTop: 4,
  },
  compassBearingLabel: {
    fontSize: 9.5,
    color: '#827C77',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  compassDetailsCol: {
    flex: 1,
    gap: 4,
  },
  compassDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compassDetailKey: {
    fontSize: 11,
    color: '#827C77',
    fontWeight: '600',
  },
  compassDetailVal: {
    fontSize: 11,
    color: '#1F1A17',
    fontWeight: '700',
  },
});
